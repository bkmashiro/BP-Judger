import { ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio, spawn } from "child_process"
import { getgid, getuid } from "process"
import * as fs from 'fs'
import * as path from 'path'
import * as mkfifo from 'mkfifo'
import { randomUUID } from "crypto"
import { EventEmitter } from "events";
import { path_to_nsjail } from "../configs/config"
 
export class NsJail extends EventEmitter {
  options: Array<{
    key: string,
    value: string
  }> = []
  jailName = randomUUID()
 
  path_to_command: string
  args: string[] = []
  signs: string[] = []
  signs_short: string[] = []
  nsjailProcess: ChildProcessWithoutNullStreams
  cmd_pipe_file: string
  targetPid: number
  onPidReceived: (pid: number) => void
  onNsjailExit: (code: number, signal: string) => void
  stdOut: string = ''
  stdErr: string = ''

  getMonitor() {
    if (!this.nsjailProcess) {
      throw new Error('You must spawn the process first')
    }
    if (!this.targetPid) {
      throw new Error('You must enable cmd_pipe first so that nsjail can send the pid to the nsjailRush')
    }
    return new NsjailMonitor(this.nsjailProcess, this.targetPid)
  }

  private constructor(path: string, args: string[] = []) {
    super()
    this.path_to_command = path
    this.args = args
  }

  add(k: string, v = undefined, isShort = false) {
    if (isShort) {
      this.signs_short.push(k)
    } else {
      if (v === undefined) {
        this.signs.push(k)
      } else {
        this.options.push({ key: k, value: v })
      }
    }
    return this
  }

  setArgs(args: any[]) {
    this.args = args.map(a => a.toString())
    return this
  }

  async spawn(config?: SpawnOptionsWithoutStdio) : Promise<string> {
    if (getuid && getuid() !== 0 && getgid && getgid() !== 0) {
      throw new Error('You must run this program as root')
    }

    if (!this.path_to_command || !fs.existsSync(this.path_to_command)) {
      throw new Error(`The path to command is not valid or unset:${this.path_to_command}`)
    }


    let closePipe = undefined
    if (this.cmd_pipe_file) {
      const fifoPath = path.resolve(this.cmd_pipe_file)
      // if exists
      if (fs.existsSync(fifoPath)) {
        throw new Error('The fifo file already exists, this may due to the previous process not closed correctly')
      }
      mkfifo.mkfifoSync(fifoPath, 0o700)

      const readStream = fs.createReadStream(fifoPath) // { encoding: 'utf8' }
      readStream.on('data', (data) => {
        // console.log(`received: ${data}`);
        if (data.toString().startsWith('pid:')) {
          const pid = parseInt(data.toString().split(':')[1])
          console.log('pid:', pid)
          this.targetPid = pid
          if (this.onPidReceived) {
            this.onPidReceived(pid)
          }
        }
      });

      readStream.on('error', (err) => {
        console.error(err);
      });

      readStream.on('end', () => {
        closePipe()
      });

      closePipe = () => {
        readStream.close()
        // remove fifo
        if (fs.existsSync(fifoPath)) {
          fs.unlinkSync(fifoPath)
          // console.log('pipe closed')
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.nsjailProcess = spawn(path_to_nsjail, this.toString().split(' '), {stdio: 'inherit'})
      this.nsjailProcess?.on('data', (data) => {
        console.log(data.toString());
      });

      this.nsjailProcess.stdout?.on('data', (data) => {
        console.log(data.toString());
        this.stdOut += data.toString();
      });

      this.nsjailProcess.stderr?.on('data', (data) => {
        this.stdErr += data.toString();
      });

      this.nsjailProcess.on('error', (err) => {
        reject(err);
      });

      this.nsjailProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        
        if (code === 0) {
          resolve(this.stdOut); // 返回输出字符串
        } else {
          reject(this.stdErr);
        }
      });

      this.nsjailProcess.addListener('exit', (code, signal) => {
        if (closePipe) {
          closePipe()
        }
        if (this.onNsjailExit) {
          this.onNsjailExit(code, signal)
        }
        this.emit('exit', code, signal)
      })
    })
  }

  exit() {
    return new Promise((resolve, reject) => {
      this.onNsjailExit = (code, signal) => {
        resolve({ code, signal })
      }
    })
  }

  ready() {
    if (!this.cmd_pipe_file) {
      throw new Error('You must enable monitor first so that nsjail can send the pid to the nsjailRush')
    }
    return new Promise((resolve, reject) => {
      this.onPidReceived = (pid) => {
        resolve(pid)
      }
    })
  }

  forceTerminate() {
    if (this.nsjailProcess) {
      this.nsjailProcess.kill('SIGKILL')
    }
  }

  static fromFile(path: string) {
    return new NsJail(path)
  }

  static asDangling() {
    return new NsJail('')
  }

  setCommand(path: string) {
    this.path_to_command = path
    return this
  }

  toString() {
    return `${this.toStringArgsArray().join(' ')} -- ${this.path_to_command} ${this.args.join(' ')}`
  }

  toArray() {
    return this.toStringArgsArray().concat('--', this.path_to_command, ...this.args)
  }

  toStringArgsArray() {
    return [...this.signs_short.map(s => `-${s}`), ...this.signs.map(s => `--${s}`), ...(this.options.map(o => `--${o.key}=${o.value}`))]
  }

  useJailName(name: string) {
    this.jailName = name
    return this
  }

  help() {
    return this.add('help')
  }

  mode(mode: 'LISTEN_TCP' | 'STANDALONE_ONCE' | 'STANDALONE_EXECVE' | 'STANDALONE_RERUN') {
    const map = {
      'LISTEN_TCP': 'l',
      'STANDALONE_ONCE': 'o',
      'STANDALONE_EXECVE': 'e',
      'STANDALONE_RERUN': 'r'
    }

    return this.add(`M${map[mode]}`, undefined, true)
  }

  exec_file(path: string) {
    return this.add('exec_file', path)
  }

  execute_fd(fd: number) {
    return this.add('execute_fd', fd.toString())
  }

  chroot(path: string) {
    return this.add('chroot', path)
  }

  no_pivotroot() {
    return this.add('no_pivotroot')
  }

  rw() {
    return this.add('rw')
  }

  user(inside_uid: number, outside_uid?: number) {
    let s = `${inside_uid}`
    if (outside_uid) {
      s += `:${outside_uid}`
    }
    return this.add('user', s)
  }

  group(inside_gid: number, outside_gid?: number) {
    let s = `${inside_gid}`
    if (outside_gid) {
      s += `:${outside_gid}`
    }
    return this.add('group', s)
  }

  hostname(v: string = 'NSJAIL') {
    return this.add('hostname', v)
  }

  cwd(v: string = '/') {
    return this.add('cwd', v)
  }

  port(v: number = 0) {
    return this.add('port', v.toString())
  }

  bindHost(v: string = '::') {
    return this.add('bindhost', v)
  }

  max_conns(v: number = 0) {
    return this.add('max_conns', v.toString())
  }

  max_conns_per_ip(v: number = 0) {
    return this.add('max_conns_per_ip', v.toString())
  }

  log(v: string = '/dev/null') {
    return this.add('log', v)
  }

  log_fd(v: number) {
    return this.add('log_fd', v.toString())
  }

  time_limit(v: number = 600) {
    return this.add('time_limit', v.toString())
  }

  max_cpus(v: number = 1) {
    return this.add('max_cpus', v.toString())
  }

  daemon() {
    return this.add('daemon')
  }

  verbose() {
    return this.add('verbose')
  }

  quiet() {
    return this.add('quiet')
  }

  really_quiet() {
    return this.add('really_quiet')
  }

  keep_env() {
    return this.add('keep_env')
  }

  env(k: string, v: string) {
    if (v === undefined) {
      return this.add('env', k)
    }
    return this.add('env', `${k}=${v}`)
  }

  cap(cap: string) {
    return this.add('cap', cap)
  }

  silent() {
    return this.add('silent')
  }

  stderr_to_null() {
    return this.add('stderr_to_null')
  }

  skip_setsid() {
    return this.add('skip_setsid')
  }

  pass_fd(fd: number) {
    return this.add('pass_fd', fd.toString())
  }

  disable_no_new_privs() {
    return this.add('disable_no_new_privs')
  }

  rlimit_as(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_as', soft.toString())
    }
    return this.add('rlimit_as', `soft:${soft},hard:${hard}`)
  }

  // nsjail --rlimit_as soft:250 --rlimit_as hard:500 -- ./your_program
  rlimit_core(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_core', soft)
    }
    return this.add('rlimit_core', `soft:${soft},hard:${hard}`)
  }

  rlimit_cpu(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_cpu', soft)
    }
    return this.add('rlimit_cpu', `soft:${soft},hard:${hard}`)
  }

  rlimit_fsize(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_fsize', soft)
    }
    return this.add('rlimit_fsize', `soft:${soft},hard:${hard}`)
  }

  rlimit_nofile(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_nofile', soft)
    }
    return this.add('rlimit_nofile', `soft:${soft},hard:${hard}`)
  }

  rlimit_nproc(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_nproc', soft)
    }
    return this.add('rlimit_nproc', `soft:${soft},hard:${hard}`)
  }

  rlimit_stack(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_stack', soft)
    }
    return this.add('rlimit_stack', `soft:${soft},hard:${hard}`)
  }

  rlimit_memlock(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_memlock', soft)
    }
    return this.add('rlimit_memlock', `soft:${soft},hard:${hard}`)
  }

  rlimit_rtprio(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_rtprio', soft)
    }
    return this.add('rlimit_rtprio', `soft:${soft},hard:${hard}`)
  }

  rlimit_msgqueue(soft: number, hard?: number) {
    if (hard === undefined) {
      return this.add('rlimit_msgqueue', soft)
    }
    return this.add('rlimit_msgqueue', `soft:${soft},hard:${hard}`)
  }

  disable_rlimits() {
    return this.add('disable_rlimits')
  }

  uid_mapping(inside_uid: number, outside_uid: number, count: number) {
    return this.add('uid_mapping', `${inside_uid}:${outside_uid}:${count}`)
  }

  gid_mapping(inside_gid: number, outside_gid: number, count: number) {
    return this.add('gid_mapping', `${inside_gid}:${outside_gid}:${count}`)
  }

  bindmount_ro(source: string, target?: string) {
    if (target === undefined) {
      return this.add('bindmount_ro', `${source}`)
    }
    return this.add('bindmount_ro', `${source}:${target}`)
  }

  bindmount_ros(source: string[]) {
    source.forEach(s => this.bindmount_ro(s))
    return this
  }

  bindmount(source: string, target?: string) {
    if (target === undefined) {
      return this.add('bindmount', `${source}`)
    }
    return this.add('bindmount', `${source}:${target}`)
  }

  tmpfsmount(source: string, target: string) {
    return this.add('tmpfsmount', `${source}:${target}`)
  }

  mount(src: string, dst: string, fstype: string, options: string) {
    return this.add('mount', `${src}:${dst}:${fstype}:${options}`)
  }

  symlink(src: string, dst: string) {
    return this.add('symlink', `${src}:${dst}`)

  }

  nice_level(v: number) {
    return this.add('nice_level', niceLevel(v))
  }

  cgroup_mem_max(v: number) {
    return this.add('cgroup_mem_max', v.toString())
  }

  cgroup_mem_memsw_max(v: number) {
    return this.add('cgroup_mem_memsw_max', v.toString())
  }

  cgroup_mem_swap_max(v: number) {
    return this.add('cgroup_mem_swap_max', v.toString())
  }

  cgroup_mem_mount(v: string) {
    return this.add('cgroup_mem_mount', v)
  }

  cgroup_mem_parent(v: string) {
    return this.add('cgroup_mem_parent', v)
  }


  cgroup_pids_max(v: number) {
    return this.add('cgroup_pids_max', v.toString())
  }

  cgroup_pids_mount(v: string) {
    return this.add('cgroup_pids_mount', v)
  }

  cgroup_net_cls_classid(v: number) {
    return this.add('cgroup_net_cls_classid', v.toString())
  }

  cgroup_net_cls_mount(v: string) {
    return this.add('cgroup_net_cls_mount', v)
  }

  cgroup_net_cls_parent(v: string) {
    return this.add('cgroup_net_cls_parent', v)
  }

  cgroup_cpu_ms_per_sec(v: number) {
    return this.add('cgroup_cpu_ms_per_sec', v.toString())
  }

  cgroup_cpu_mount(v: string) {
    return this.add('cgroup_cpu_mount', v)
  }

  cgroup_cpu_parent(v: string = 'NSJAIL') {
    return this.add('cgroup_cpu_parent', v)
  }

  cgroupv2_mount(v: string) {
    return this.add('cgroupv2_mount', v)
  }

  use_cgroupv2() {
    return this.add('use_cgroupv2')
  }

  detect_cgroupv2() {
    return this.add('detect_cgroupv2')
  }

  iface_no_lo() {
    return this.add('iface_no_lo')
  }

  iface_own(v: string) {
    return this.add('iface_own', v)
  }

  forward_signals() {
    return this.add('forward_signals')
  }

  disable_proc() {
    return this.add('disable_proc')
  }

  CPULimit(limit: CPULimit) {
    if (!limit.cpu_ms_per_sec || limit.cpu_ms_per_sec === "UNLIMITED") {
      limit.cpu_ms_per_sec = 0
    }
    this.cgroup_cpu_ms_per_sec(limit.cpu_ms_per_sec)
    return this.rlimit_core(limit.cpu)
  }

  MemLimit(limit_MB: number) {
    this.rlimit_as(limit_MB)
    this.cgroup_mem_max(limit_MB * 1024 * 1024)
    return this
  }

  enable_monitor() {
    const file_name = path.resolve('.' + this.jailName + '.pipe')
    this.cmd_pipe_file = file_name
    return this.add('cmd_pipe', file_name)
  }

  loadConfig(config: NsJailConfig) {
    if (config.mount) {
      config.mount.forEach(m => this.bindmount(m))
    }
    if (config.mount_readonly) {
      config.mount_readonly.forEach(m => this.bindmount_ro(m))
    }
    if (config.timeout) {
      this.time_limit(config.timeout)
    }
    if (config.mem_max) {
      this.MemLimit(config.mem_max)
    }
    if (config.pid_max) {
      this.rlimit_nproc(config.pid_max)
    }
    if (config.user) {
      this.user(config.user, config.user)
    }
    if (config.group) {
      this.group(config.group, config.group)
    }
    if (config.mode) {
      this.mode(config.mode)
    }
    if (config.cwd) {
      this.cwd(config.cwd)
    }
    if (config.chroot) {
      this.chroot(config.chroot)
    }
    if (config.safetySetup) {
      this.safetySetup()
    }
    if (config.env) {
      for (const [k, v] of Object.entries(config.env)) {
        this.env(k, v)
      }
    }
    return this
  }

  safetySetup(){
    this.disable_proc()
  }
}

export type NsJailConfig = {
  mount? : string[],
  mount_readonly: string[],
  timeout?: number,
  mem_max?: number,
  pid_max?: number,
  user?: number,
  group?: number,
  mode? : 'LISTEN_TCP' | 'STANDALONE_ONCE' | 'STANDALONE_EXECVE' | 'STANDALONE_RERUN'
  cwd?: string
  chroot?: string
  safetySetup?: boolean
  env?: {
    [key: string]: string
  }
}

export const basic_jail_config = {
  mount: [],
  mount_readonly: ["/bin", "/lib", "/lib64/", "/usr/", "/sbin/", "/dev", "/dev/urandom"],
  timeout: 10,
  mem_max: 256,
  user: 1919,
  group: 1919,
  pid_max: 32,
  safetySetup: true,
  env: {}
}

type CPULimit = {
  cpu: number,
  cpu_ms_per_sec?: number | "UNLIMITED"
}

type NiceLevel = number & { _: "NiceLevel" };

const niceLevel = (value: number): NiceLevel => {
  if (value < -20 || value > 19) {
    throw new Error(`The value ${value} is not a valid nice level`);
  }

  return value as NiceLevel;
}
enum SUBSYSTEMS {
  CPU = 'cpu',
  CPUACCT = 'cpuacct',
  CPUSHARES = 'cpuset',
  MEMORY = 'memory',
}

enum MEMORY_ITEMS {
  USAGE_IN_BYTES = 'memory.usage_in_bytes',

  STATS = 'memory.stat',
}

enum CPU_ITEMS {
  USAGE = 'cpuacct.usage',
  USAGE_PER_CPU = 'cpuacct.usage_percpu',
  USAGE_USER = 'cpuacct.usage_user',
  USAGE_PER_CPU_USER = 'cpuacct.usage_percpu_user',
  USAGE_SYS = 'cpuacct.usage_sys',
  USAGE_PER_CPU_SYS = 'cpuacct.usage_percpu_sys',
  USAGE_ALL = 'cpuacct.usage_all',

  STATS = 'cpuacct.stat',
}

class NsjailMonitor {
  hostName = 'NSJAIL'
  sub: ChildProcessWithoutNullStreams
  pid: number
  constructor(sub: ChildProcessWithoutNullStreams, pid) {
    this.sub = sub
    this.pid = pid
  }

  getUsage = async (section: string, item: string) => {
    let usage = -1
    try {
      const memUsagePath = path.join(section, item)
      const memUsage = await fs.promises.readFile(memUsagePath, { encoding: 'utf8' })
      usage = parseInt(memUsage)
    } catch (e) {
      console.error(e)
    } finally {
      return usage
    }
  }

  getUsageStr = async (section: string, item: string) => {
    let usage = ''
    try {
      const memUsagePath = path.join(section, item)
      const memUsage = await fs.promises.readFile(memUsagePath, { encoding: 'utf8' })
      usage = memUsage
    } catch (e) {
      console.error(e)
    } finally {
      return usage
    }
  }

  async getMemUsage() {
    return this.getUsage(this.cgpMemory, MEMORY_ITEMS.USAGE_IN_BYTES)
  }

  async getMemStats() {
    return this.getUsageStr(this.cgpMemory, MEMORY_ITEMS.STATS)
  }


  async getCPUUsage() {
    return {
      user: await this.getUsage(this.cgpCPU, CPU_ITEMS.USAGE_USER),
      sys: await this.getUsage(this.cgpCPU, CPU_ITEMS.USAGE_SYS),
    }
  }

  public get cgpCPU(): string {
    return path.join('/sys/fs/cgroup', SUBSYSTEMS.CPU, this.hostName, this.groupName)
  }

  public get cgpMemory(): string {
    return path.join('/sys/fs/cgroup', SUBSYSTEMS.MEMORY, this.hostName, this.groupName)
  }

  public get groupName(): string {
    return `NSJAIL.${this.pid}`
  }
}