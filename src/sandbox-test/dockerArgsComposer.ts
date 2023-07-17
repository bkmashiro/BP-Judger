import * as path from 'path';

class DockerCommand {
  args: Record<string, string> = {}
  action: string
  image: string

  constructor(action: string, image: string){
    this.action = action
    this.image = image
  }

  add(k, v = undefined){
    this.args[k] = v
    return this
  }

  rm(){
    return this.add('rm')
  }

  interactive(){
    return this.add('interactive')
  }

  attach(v : "STDIN"| "STDOUT" | "STDERR"){
    return this.add('attach', v)
  }

  init(){
    return this.add('init')
  }

  pull(v: "never"| "always" | "missing"){
    return this.add('pull', v)
  }

  stopTimeout(v: number){
    return this.add('stop-timeout', v.toString())
  }

  cidFile(v: string){
    return this.add('cidfile', v)
  }

  network(v: "none"| "host" | "bridge"){
    return this.add('network', v)
  }

  entrypoint(v: string){
    return this.add('entrypoint', v)
  }

  memory(v: number){
    return this.add('memory', v.toString())
  }

  memorySwap(v: number){
    return this.add('memory-swap', v.toString())
  }

  memorySwappiness(v: number){
    return this.add('memory-swappiness', v.toString())
  }

  pidLimit(v: number){
    return this.add('pids-limit', v.toString())
  }

  ulimit(v: string){
    return this.add('ulimit', v)
  }

  cpus(v: number){
    return this.add('cpus', v.toString())
  }

  user(uid: number, gid?: number){
    let s = `--user=${uid}`
    if (gid) {
      s += `:${gid}`
    }
    return this.add(s)
  }

  workdir(v: string){
    return this.add('workdir', v)
  }

  env(k: string, v: string){
    return this.add('env', `${k}=${v}`)
  }

  envs(envs: Record<string, string>){
    if (Object.keys(envs).length === 0){
      return this
    }
    let envsStr = []
    for(const [k, v] of Object.entries(envs)){
      envsStr.push(`${k}=${v}`)
    }
    return this.add('envs', envsStr.join(' '))
  }

  mount(type,source,target,isReadonly = true){
    return this.add('mount', `type=${type},source=${source},target=${target}${isReadonly ? ",readonly" : ""}`)
  }


  mounts(mounts: Mountable[]){
    if (!mounts || mounts.length === 0){
      return this
    }
    mounts.forEach(mount => {
      this.mount(
        mount.type ?? 'bind', 
        path.resolve(mount.source), 
        mount.target ?? mount.source, 
        mount.readonly
        )
    })
    return this
  }

  toString(){
    return this.toStringArray().join(' ')
  }

  toStringArray() {
    return [this.action, ...Object.entries(this.args).map(([k, v]) => `--${k}${(v ?? "") && ` ${v}`}`), this.image]
  }
}

export type Mountable = {
  type?: "bind" | "tmpfs";
  source: string;
  target?: string;
  readonly?: boolean;
}
export class DockerCommandComposer {
  static run(imageId: string) {
    return new DockerCommand('run', imageId)
  }
}