import * as fs from 'fs'
import { runCommand } from './pipelining/executors/commandExecutor'

export default function Init() {
  // check if root
  if (process.getuid() !== 0 || process.getgid() !== 0) {
    console.error('Please run as root')
    throw Error('Init failed: not root')
  }

  // enable ip forward
  runCommand('echo 1 > /proc/sys/net/ipv4/ip_forward')

  // Init paths
  const dirs = [
    '/sys/fs/cgroup/memory/NSJAIL',
    '/sys/fs/cgroup/cpu,cpuacct/NSJAIL',
    '/tmp/code',
  ]

  try {
    dirs.forEach(dir => {
      makeDirIfNotExist(dir)
    })
    console.log('dirs Init success')
  } catch (e) {
    console.error(e)
    throw Error('Init failed: make dir failed')
  }
}

function makeDirIfNotExist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}