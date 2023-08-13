import { JailedCommandAssembler, SystemCommandAssembler, runCommand } from "./executors/commandExecutor"
import { IModule } from "./modules/IModule"
import { recursive_render_obj, render } from "../utils"
import * as fs from 'fs'
import * as path from 'path'
import { config, base_config } from "../configs/config"
import { Logger } from "@nestjs/common"
import * as chalk from 'chalk';

export class BKPileline {
  config: object
  context: object = {
    "@src": config.src_path,
  }
  cache: object = {}
  private readonly logger = new Logger(BKPileline.name);
  
  constructor(config_path: string | object) {
    if (typeof config_path === 'object') {
      this.config = config_path
    } else {
      this.config = JSON.parse(fs.readFileSync(config_path, 'utf8'))
    }
    // this.context = this.config['constants'] ?? {}
    this.context = Object.assign(this.context, recursive_render_obj(this.config['constants'], this.context))
  }

  async run() : Promise<object[]> {
    const jobs = this.config['jobs']
    const onSuccess = this.config['onSuccess'] ?? 'next'
    const onFailure = this.config['onFailure'] ?? 'stop'
    const rets = []

    for (const job of jobs) {
      if(!job.hasOwnProperty('name')) {
        job.name = '<Anonymous>'
      }
      const executor = new JobExecutor(job)
      executor.inject(this.context)
      try {
        this.logger.log(`Running job ${job.name}`)
        const startTime = Date.now()      // start time
        
        const ret = await executor.run()  // run job
        rets.push(ret)

        const endTime = Date.now()        // end time
        const duration = endTime - startTime

        this.logger.log(`${chalk.white('Job')} ${chalk.blueBright(job.name) } finished \t +${chalk.yellow(duration.toString(), 'ms')}`)
        this.logger.log(`return value: ${chalk.greenBright(JSON.stringify(ret))}`)
        this.job_completion_strategy[onSuccess]()
        // bind the return value to context
        if (typeof ret === 'string') {
          this.context[job.name] = ret
        } else if (typeof ret === 'object') {
          for (const key in ret) {
            this.context[`${job.name}.${key}`] = ret[key]
          }
        }
      } catch (err) {
        console.log(`when executing job ${job.name}`, err)
        this.job_completion_strategy[onFailure](err.message)
        return err
      }
    }
    return rets
  }

  job_completion_strategy = {
    'next': () => { },
    'stop': (msg: string) => { throw new Error(msg) },
  }

  static registerModule(module_name: string, module: IModule) {
    JobExecutor.register_module(module_name, module)
  }

  ctx(dict: { [x: string]: any; }) {
    this.context = Object.assign(this.context, dict)
    return this
  }

  public static fromConfig(config: object) {
    return new BKPileline(config)
  }

  public static fromJobs(...jobs: object[]) {
    return new BKPileline({
      jobs: jobs
    })
  }

  static predefined(pipelineName: string) {
    return BKPileline.fromConfig(require_config(pipelineName))
  }

  toObject() {
    return this.config
  }
} 

export function require_procedure(procedure_name: string) : ProcedurePiece {
  const procedure_path = path.resolve(config.configs_path,`./procedures/${procedure_name}.json`)
  if (! fs.promises.access(procedure_path)) {
    throw new Error(`Procedure ${procedure_name} not found`)
  }
  return new ProcedurePiece(JSON.parse(fs.readFileSync(procedure_path, 'utf8')))
}

export function require_config(config_name: string) : object {
  const config_path = path.resolve(config.configs_path,`./predefined/${config_name}.json`)
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
  named(name:string) {
    this.raw['name'] = name
    return this
  }

  with(ctx:object) {
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

  compile(ctx:object={}) {
    const jobs = recursive_render_obj(this.raw, ctx)
    return jobs
  }
}

export class JobExecutor {

  context: object
  job: object

  constructor(job: object) {
    this.job = job
    this.context = {}
  }

  async run() {
    if (this.job.hasOwnProperty('run')) {
      let command = render(this.job['run'], this.context)
      if (!command) throw new Error(`Command is empty`)
      //spilt command into command and args
      const args = command.split(' ')
      command = args.shift()

      const assembled = this.assemble_command(command, args)
      if (this.job.hasOwnProperty('verbose') && this.job['verbose']) {
        console.log(`@running:`,assembled)
      }
      const ret = await runCommand(assembled)
      if (this.job.hasOwnProperty('verbose') && this.job['verbose']) {
        console.log(`@returing:`,ret)
      }
      return ret

    } else if (this.job.hasOwnProperty('use')) {
      const module_name = this.job['use']
      const with_ = recursive_render_obj(this.job['with'], this.context)
      return this.run_module(module_name, with_, this.context)
    } else {
      throw new Error(`Unknown job type`)
    }
  }

  assemble_command(command: string, args: string[]) { //TODO: refactor this, use interceptors
    let cmd: string = command
    if (this.job.hasOwnProperty('netns')) {
      Object.assign(this.job['jail'], {disable_clone_newnet: true})
    }

    if (this.job.hasOwnProperty('jail')) {
      const jailConfig = recursive_render_obj(this.job['jail'], this.context)
      const executor = new JailedCommandAssembler(jailConfig)
      cmd = executor.assemble(cmd, args)
    } else {
      const executor = new SystemCommandAssembler()
      cmd = executor.assemble(cmd, args)
    }

    if (this.job.hasOwnProperty('netns')) { //TODO clean this up
      const netns = this.job['netns']
      cmd = `/usr/sbin/ip netns exec ${netns} ${cmd}`;
    }
    // console.log(cmd)
    return cmd
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
    return this.job['name']
  }

  public inject(ctx: { [x: string]: any; }) {
    this.context = ctx
  }

  public static register_module(module_name: string, module: IModule) {
    JobExecutor.modules[module_name] = module
  }
}