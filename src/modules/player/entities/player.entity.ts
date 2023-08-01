import { PlayerProxyManager } from "../../../game/players/playerProxy/playerProxy";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { config } from "../../../configs/config";
import { createHash } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'
import { BKPileline, require_procedure } from "../../../pipelining/pipelining";
import { basic_jail_config } from "src/jail/NsjailRush";
import { Logger } from "@nestjs/common";

export type PlayerID = string

export class Player implements IPlayer {
  id: PlayerID
  type: PlayerType
  name: string
  tags: string[]
  code?: Code
  static fromObject(player: CreatePlayerDto) : Player {
    const newPlayer = new Player()
    // TODO
    return newPlayer
  }
  static proxyPlayerManager = new PlayerProxyManager()

  static async newProxyPlayer(name: string, tags: string[], code: Code): Promise<Player> {
    const player = new Player()
    const proxy = Player.proxyPlayerManager.newPlayer()
    player.id = proxy.uuid
    player.type = PlayerType.PROXY
    player.name = name
    player.tags = tags
    player.code = code
    return player
  }
  
  async prepare(): Promise<void> {
    if (this.type === PlayerType.PROXY) {
      Logger.log(`Preparing player ${this.id}`)
      // 1. generate code file
      // 2. compile (if needed)
      // 3. run
      const code = this.code
      if (!code) {
        throw new Error('Code not found')
      }
      const codePath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, code.filename))
      const codeOutPath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, `/cmake/build/test`))
      const logPath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, `${this.id}.log`))
      //make log file
      await fs.promises.writeFile(logPath, '')
      await fs.promises.chown(logPath, config.uid, config.gid)
      await fs.promises.chown(codePath, config.uid, config.gid)
      await fs.promises.mkdir(path.dirname(codePath), { recursive: true })
      await fs.promises.writeFile(codePath, code.src)
      await BKPileline.predefined('cmake_g++_c++14_grpc_player_compile_and_run').ctx({
        in_file_name: codePath,
        out_file_name: codeOutPath,
        gameId: this.id,
        log: logPath,
        cwd: config.CODE_FILE_TEMP_DIR,
        cmake_lists: "/home/shiyuzhe/lev/bp/bp-judger/src/configs/cmakes/cpp_bot_use_template/CMakeLists.txt",
        cmake_lists_common: "/home/shiyuzhe/lev/bp/bp-judger/src/configs/cmakes/cpp_bot_use_template/common.cmake"
      }).run()

    } else if (this.type === PlayerType.HUMAN) {
      
    } else if (this.type === PlayerType.LOCAL) {
      
    } else {
      throw new Error('Unknown player type')
    }
  }
}



export enum PlayerType {
  HUMAN = "human",
  PROXY = "proxy",
  LOCAL = "local", // NOT USED
}

export interface IPlayer {
  type: PlayerType;
  id: PlayerID;
  name: string;
  tags?: string[];
  prepare(): void;
}

export interface IHumanPlayer extends IPlayer {
  type: PlayerType.HUMAN;
}

export interface Code {
  lang: string;
  filename: string;
  version: string;
  tags: string[];
  src: string;
  [key: string]: any;
}

export interface IBotPlayer extends IPlayer {
  type: PlayerType.PROXY;
  code: Code;
}


