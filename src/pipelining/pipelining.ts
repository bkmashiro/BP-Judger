import { JailedCommandAssembler, SystemCommandAssembler, runCommand } from "./executors/commandExecutor"
import { IModule, ModuleRunResult } from "./modules/IModule"
import { propEqualsThenDo, recursive_render_obj, render, timed, timeout, ifTrueThenDo, ifNotNullDo, ifUndefinedThenAssign } from "../utils"
import * as fs from 'fs'
import * as path from 'path'
import { config, base_config } from "../configs/config"
import { Logger } from "@nestjs/common"
import * as chalk from 'chalk'
import { Job } from "./pipelining.decl"
import { NsJail } from "src/jail/NsjailRush"
import { CompileStrategy } from "src/executables/executables"
import { error } from "console"

const logger = new Logger('Pilelining');

export interface Context {
  '@src': string;
  'cwd'?: string;
  [key: string]: string | undefined;
}

export class BKPileline {
  config: object
  context: Context = { // The following are predefined variables
    "@src": config.src_path,
  }
  timeout_ms: number = 0
  onSuccess = 'next'
  onFailure = 'stop'
  ret?: object

  constructor(cfg: string | { jobs: Job[] }) {
    if (typeof cfg === 'object') {
      this.config = cfg
    } else {
      this.config = JSON.parse(fs.readFileSync(cfg, 'utf8'))
    }
    this.context = Object.assign(this.context, recursive_render_obj(this.config['constants'], this.context))
  }

  async run(ctx : {[key: string]: string} = undefined, ignore_timeout = false): Promise<object> {
    if (ctx) {
      this.ctx(ctx)
    }
    // console.log(`ctx is`,this.context)
    // if has timeout, run with timeout
    if (!ignore_timeout && this.timeout_ms != 0) {
      return timeout(this.run(ctx, true), this.timeout_ms)
    }
    
    const { jobs } = this.initRun()
    // console.log(`jobs are`, jobs)
    const rets = {}
    let job_cnt = 0
    for (const job of jobs) {
      formatJob(job)
      job_cnt++
      ifUndefinedThenAssign(job, 'name', 'job_' + job_cnt.toString())
      const executor = new JobExecutor(job, this.context)

      try {
        logger.log(`Running job ${job.name} in pileline ${this.config['name'] ?? '<Anonymous>'}`)
        const [ret, duration] = await timed(() => executor.run())
        rets[job.name] = ret
        logger.log(`${chalk.white('Job')} ${chalk.blueBright(job.name)} finished \t +${chalk.yellow(duration.toString(), 'ms')}`)
        this.updateCtx(ret, job)
        this.conditional(this.onSuccess)
      } catch (err) {
        console.log(`when executing job ${job.name}`, err)
        this.conditional(this.onFailure)
        throw err //by default, if a job failed, the whole pipeline failed
      }
    }
    this.ret = rets
    return rets
  }

  private initRun() {
    this.onSuccess = this.config['onSuccess'] ?? 'next'
    this.onFailure = this.config['onFailure'] ?? 'stop'
    const jobs = this.config['jobs']
    //TODO need to check duplicate job names
    return { jobs }
  }

  private conditional(strategy) {
    this.job_completion_strategy[strategy]()
  }

  job_completion_strategy = {
    'next': () => { },
    'stop': (msg: string) => { throw new Error(msg) },
  }

  private updateCtx(ret: Promise<unknown>, job: Job) {
    if (typeof ret === 'string') {
      this.context[job.name] = ret
    } else if (typeof ret === 'object') {
      for (const key in ret) {
        this.context[`${job.name}.${key}`] = ret[key]
      }
    }
  }

  static registerModule(module_name: string, module: IModule) {
    JobExecutor.register_module(module_name, module)
  }

  ctx(dict: { [x: string]: any; }) {
    this.context = Object.assign(this.context, dict)
    return this
  }

  public static fromConfig(config: { jobs: Job[] }) {
    return new BKPileline(config)
  }

  public static fromJobs(...jobs: Job[]) {
    return new BKPileline({
      jobs: jobs
    })
  }

  getJobByName(name: string) {
    const jobs = this.config['jobs']
    for (const job of jobs) {
      if (job.name === name) {
        return job
      }
    }
    return null
  }

  public static fromJobAbbrs(jobabbrs: CompileStrategy.JobAbbr[]) {
    const jobs = jobabbrs.map(jobabbr => JobAbbrToJob(jobabbr))
    return new BKPileline({
      jobs: jobs
    })
  }

  getRet(name) {
    return this.ret[name]
  }

  static predefined(pipelineName: string) {
    return BKPileline.fromConfig(require_config(pipelineName))
  }

  toObject() {
    return this.config
  }

  setTimeout(timeout: number) {
    this.timeout_ms = timeout
    return this
  }
}

function formatJob(job: Job) {
  // ifUndefinedThenAssign(job, 'name', '<Anonymous>')
}

function JobAbbrToJob(jobAbbr: CompileStrategy.JobAbbr): Job {
  const { file_no_limit, memory_limit_kb, mount, mount_ro, mount_tmp, netns, time_limit_ms, use_jail, name } = jobAbbr //TODO: impl this
  const mergeNetns = (job : Job) => { //TODO refactor this
    if (!netns) return job
    job.netns = netns
    return job
  }
  if ('require' in jobAbbr) {
    const { require, with: _with } = jobAbbr
    return mergeNetns(require_procedure(require).asRaw())
  } else if ('use' in jobAbbr) {
    const { use, with: _with } = jobAbbr
    return mergeNetns(require_procedure(use).asRaw())
  } else if ('run' in jobAbbr) {
    const { run } = jobAbbr
    const jail = use_jail
      ? {
        file_no_limit,
        mem_max: memory_limit_kb,
        mount,
        mount_readonly: mount_ro,
        mount_tmpfs: mount_tmp,
        timeout: time_limit_ms,
      }
      : undefined;
    return  mergeNetns({
      name: `<Anonymous>`,
      run,
      jail
    })
  } else throw new error(`Invalid job abbr `, jobAbbr)
}

export function require_procedure(procedure_name: string): ProcedurePiece {
  const procedure_path = path.resolve(config.configs_path, `./procedures/${procedure_name}.json`)
  if (!fs.promises.access(procedure_path)) {
    throw new Error(`Procedure ${procedure_name} not found`)
  }
  return new ProcedurePiece(JSON.parse(fs.readFileSync(procedure_path, 'utf8')))
}

export function require_config(config_name: string): {jobs: Job[]} {
  const config_path = path.resolve(config.configs_path, `./predefined/${config_name}.json`)
  if (!fs.promises.access(config_path)) {
    throw new Error(`Config ${config_name} not found`)
  }
  return JSON.parse(fs.readFileSync(config_path, 'utf8'))
}

class ProcedurePiece {
  raw: object
  constructor(raw: object) {
    this.raw = raw
  }
  named(name: string) {
    this.raw['name'] = name
    return this
  }

  with(ctx: object) {
    if (!this.raw.hasOwnProperty('with')) {
      this.raw['with'] = {}
    }
    this.raw['with'] = Object.assign(this.raw['with'], ctx)
    return this
  }

  set(kv: object) {
    this.raw = Object.assign(this.raw, kv)
    return this
  }

  jail(jailConfig: object) {
    this.raw['jail'] = jailConfig
    return this
  }

  compile(ctx: object = {}) {
    const jobs = recursive_render_obj(this.raw, ctx)
    return jobs
  }

  asRaw() {
    return this.raw as Job
  }
}

// CoR pattern
interface ICommandHandler {
  handle(inner: string, context: { [key: string]: string }): string
}


class PlainSystemCommandHandler implements ICommandHandler {
  handle(_: string, context: { [key: string]: any }): string {
    return `${context.command} ${context.args.join(' ')}`
  }
}

class NSJailCommandHandler implements ICommandHandler {
  handle(inner: string, context: { [key: string]: any }): string {
    if (!context.hasOwnProperty('jail')) {
      return inner
    }
    if (context.netns) {
      ifUndefinedThenAssign(context.jail, 'disable_clone_newnet', { disable_clone_newnet: true })
    }

    const jail = NsJail.asDangling().loadConfig(context.jail)

    jail.setCommand(inner)

    return jail.getCommand()
  }
}

class NetnsCommandHandler implements ICommandHandler {
  handle(inner: string, context: { [key: string]: any }): string {
    if (!context.hasOwnProperty('netns')) {
      return inner
    }
    return `/usr/sbin/ip netns exec ${context.netns} ${inner}`
  }
}
export class JobExecutor {

  context: object
  job: Job

  constructor(job: Job, context = {}) {
    this.job = job
    this.context = context
  }

  async run(): Promise<ModuleRunResult | any> {
    if (this.job.hasOwnProperty('run')) {
      return await this.handleRun()
    } else if (this.job.hasOwnProperty('use')) {
      return await this.handleUse()
    } else {
      throw new Error(`Unknown job type`)
    }
  }

  private async handleUse() {
    const module_name = this.job['use']
    const with_ = recursive_render_obj(this.job['with'], this.context)
    return await this.run_module(module_name, with_, this.context)
  }

  private async handleRun() {
    let command = render(this.job['run'], this.context)
    if (!command) throw new Error(`Command is empty`)
    //spilt command into command and args
    const args = command.split(' ')
    command = args.shift()
    const assembled = this.assemble_command(command, args)
    ifTrueThenDo(this.job.verbose, () => console.log(`# ${this.name}.cmd = \n`, assembled))
    const ret = await runCommand(assembled)
    ifTrueThenDo(this.job.verbose, () => console.log(`# ${this.name}.ret = \n`, ret))
    return ret
  }

  static filters: ICommandHandler[] = [
    new PlainSystemCommandHandler(),
    new NSJailCommandHandler(),
    new NetnsCommandHandler(),
  ]

  assemble_command(command: string, args: string[]): string { //TODO: refactor this, use interceptors
    let ctx: { [key: string]: any } = Object.assign({
      command,
      args
    }, this.job, this.context)

    for (const filter of JobExecutor.filters) {
      command = filter.handle(command, ctx)
      command = render(command, ctx)
    }
    return command
  }

  static modules: {
    [x: string]: IModule;
  } = {}

  async run_module(module: string, _with: object, ctx = undefined) {
    if (JobExecutor.modules.hasOwnProperty(module)) {
      return JobExecutor.modules[module].run(_with, ctx)
    } else {
      throw new Error(`Module ${module} not found`)
    }
  }

  public get name(): string {
    return this.job.name
  }

  public inject(ctx: { [x: string]: any; }) {
    this.context = ctx
  }

  public static register_module(module_name: string, module: IModule) {
    JobExecutor.modules[module_name] = module
  }
}


