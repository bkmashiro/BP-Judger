import { exec } from "child_process";
import { NsJail } from "../../../sandbox-test/nsjailRush";

export interface CommandExecutor {
  run(command: string, args: string[]): Promise<string>;
}

export class JailedCommandExecutor implements CommandExecutor {
  jail: NsJail
  constructor(jailConfig) {
    this.jail = NsJail.asDangling().loadConfig(jailConfig)
  }

  async run(command: string, args: string[]): Promise<string> {
    // console.log(`JailedCommandExecutor.run(${command}, ${args})`)
    this.jail.setCommand(command).setArgs(args)
    return this.jail.spawn()
  }
}

export class SystemCommandExecutor implements CommandExecutor {
  run(command: string, args: string[]): Promise<string> {
    command = command + ' ' + args.join(' ')
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout)
      })
    })
  }
}
