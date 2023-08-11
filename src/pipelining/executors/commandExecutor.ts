import { exec } from "child_process";
import { NsJail, NsJailConfig } from "../../jail/NsjailRush";

export interface CommandAssembler {
  assemble(command: string, args: string[]): string;
}

export class JailedCommandAssembler implements CommandAssembler {
  jail: NsJail
  constructor(jailConfig: NsJailConfig) {
    this.jail = NsJail.asDangling().loadConfig(jailConfig)
  }

  assemble(command: string, args: string[]) {
    this.jail.setCommand(command).setArgs(args)
    return this.jail.getCommand()
  }
}

export class SystemCommandAssembler implements CommandAssembler {
  assemble(command: string, args: string[]) {
    command = command + ' ' + args.join(' ')
    return command
  }
}

export function runCommand(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      }
      resolve(stdout)
    })
  })
}
