// to run this file: sudo ts-node test.main.ts


import { NsJail } from "./nsjailRush";
// import fs from "fs";
// import path from "path";
import * as fs from 'fs';
import * as path from 'path';
import { hrtime } from 'node:process';

const exec_file = './dummy/calc-dummy'
const dummy_args = [2, 1000, 2000, 1000, 2000]
// const exec_file = '/home/shiyuzhe/lev/bp/bp-judger/src/sandbox/dummy/memory-dummy'
// const dummy_args = [10, 100000, 2000000, 1000]
// const exec_file = '/usr/bin/sleep'
// const dummy_args = [20]
const log_file = './nsjail.log'

  ; (async () => { 
    const logPath = path.resolve(log_file);
    const logFileFH = await fs.promises.open(logPath, "w", 0o700);
    const stdio: any[] = ["ignore", "pipe", "pipe"];
    stdio[1] = logFileFH.fd;
    stdio[2] = logFileFH.fd;

    const jail =
      NsJail
        .fromFile(path.resolve(exec_file))
        .setArgs(dummy_args)//.verbose()
        .useJailName('test')
        .mode('STANDALONE_ONCE')
        .CPULimit({ cpu: 1, cpu_ms_per_sec: 1000 })// if set to "UNLIMITED", this wont create cpu cgroup
        .MemLimit(256) // MB
        .user(0)
        .group(99999)
        .bindmount_ros(['/bin/', '/lib', '/lib64/', '/usr/', '/sbin/', '/dev', '/dev/urandom'])
        .bindmount(path.resolve('.'))
        .cmd_pipe()

    let begin_time = hrtime.bigint(), endTime = BigInt(0)
    jail.spawn({ stdio })
    await jail.Ready()
    const monitor = jail.getMonitor()

    let timer = setInterval(async () => {
      const memUsage = await monitor.getMemUsage()
      console.log(`Mem: ${memUsage} Bytes; ${(await monitor.getMemStats()).split('\n').filter((line: string) => line.startsWith('rss'))[0]}`)
      const cpuUsage = await monitor.getCPUUsage()
      console.log(`CPU: ${cpuUsage.sys / 1000 / 1000} ms (sys), ${cpuUsage.user / 1000 / 1000} ms (user)`)
    }, 1000)

    jail.on('exit', async (code, signal) => {
      endTime = hrtime.bigint()
      console.log(`jail.on('exit'), code: ${code}, signal: ${signal}`)
      clearInterval(timer)
    })

    await jail.Exit()

    console.log(`Time used: ${(endTime - begin_time) / BigInt(1e6)} ms`)
    logFileFH.close()
  })();