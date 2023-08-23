import * as fs from 'fs'
import { runCommand } from './pipelining/executors/commandExecutor'
import { FileHelper } from './utils'

export default async function Init() {
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
    '/tmp/ccache'
  ]

  try {
    dirs.forEach(dir => {
      makeDirIfNotExist(dir)
    })
  } catch (e) {
    console.error(e)
    throw Error('Init failed: make dir failed')
  }

  await new FileHelper()
  .push('chown', '/tmp/code', 1919, 1919)
  .push('chgrp', '/tmp/code', 1919, 1919)
  .push('chown', '/tmp/ccache', 1919, 1919)
  .push('chgrp', '/tmp/ccache', 1919, 1919)
  .run()

}

function makeDirIfNotExist(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}