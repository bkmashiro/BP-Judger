import { PlayerProxyManager } from "../../../game/players/playerProxy/playerProxy";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { config } from "../../../configs/config";
import { createHash } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'
import { BKPileline, require_procedure } from "../../../pipelining/pipelining";
import { basic_jail_config } from "src/jail/NsjailRush";
import { Logger } from "@nestjs/common";
import { FileCache } from "src/pipelining/modules/FileCacheModule/fileCacheModule";
import { PreparedPlayerType } from "src/modules/game/dto/create-game.dto";
import { Entity } from "typeorm";

export type PlayerInstID = string

export class PlayerInstance implements IPlayerInst {
  id: PlayerInstID
  type: PlayerInstType
  name: string
  tags: string[]
  code?: Code

  static fromObject(player: CreatePlayerDto): PlayerInstance {
    const newPlayer = new PlayerInstance()
    // TODO
    throw new Error("Method not implemented.");
    return newPlayer
  }
  
  static proxyPlayerManager = PlayerProxyManager.instance

  static async newProxyPlayer(name: string, tags: string[], code: Code): Promise<PlayerInstance> {
    const player = new PlayerInstance()
    const proxy = PlayerInstance.proxyPlayerManager.newPlayer()
    player.id = proxy.uuid
    player.type = PlayerInstType.PROXY
    player.name = name
    player.tags = tags
    player.code = code
    return player
  }

  async prepare(): Promise<PreparedPlayerType> {
    if (this.type === PlayerInstType.PROXY) {
      const execPath = await prepare_proxy_player(this)
      Logger.log(`Player ${this.id} prepared at ${execPath}`)
      return {
        type: 'bot',
        botId: this.id,
        execPath,
      }
    } else if (this.type === PlayerInstType.HUMAN) {

    } else if (this.type === PlayerInstType.LOCAL) {

    } else {
      throw new Error('Unknown player type')
    }
  }
}

async function prepare_proxy_player(player: PlayerInstance) :Promise<string> {
  // 1. generate code file
  // 2. compile (if needed)
  const code = player.code
  if (!code) {
    throw new Error('Code not found')
  }
  const code_fingerprint = createHash('md5').update(code.src).digest('hex')
  if (await FileCache.instance.has(code_fingerprint)) { // if cached, skip compile
    const codeOutPath = await FileCache.instance.get(code_fingerprint)
    return codeOutPath
  }
  const basePath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, code_fingerprint))
  const codePath = path.resolve(path.join(basePath, code.filename))
  const codeOutPath = path.resolve(path.join(basePath, `/cmake/build/test`))
  await fs.promises.mkdir(path.dirname(codePath), { recursive: true })
  await fs.promises.writeFile(codePath, code.src)
  await fs.promises.chown(codePath, config.uid, config.gid)
  // const ret = await BKPileline.fromConfig({
  //   jobs: [
  //     {
  //       name: 'compile',
  //       use: 'compile',
  //       with: {
  //         compile_pipeline_name: player.code.pipeline_name,
  //         pipeline_ctx: {
  //           in_file_name: codePath,
  //           out_file_name: codeOutPath,
  //           gameId: player.id,
  //           cwd: config.CODE_FILE_TEMP_DIR,
  //         },
  //       }
  //     },
  //     {
  //       name: "cache_set",
  //       use: "filecache",
  //       with: {
  //         action: "set",
  //         key: code_fingerprint,
  //         value: codeOutPath,
  //       }
  //     }
  //   ]
  // }).run()

  const ret2 = await BKPileline.fromJobs(
    require_procedure('c++14_grpc_player_compile').with({
      pipeline_ctx: {
        in_file_name: codePath,
        out_file_name: codeOutPath,
        cwd: basePath,
      },
    }).compile(),
    require_procedure('filecache_set').with({
      key: code_fingerprint,
      value: codeOutPath,
    }).compile()
  ).run()
  console.log(ret2)

  return codeOutPath
}

async function run_proxy_player(execPath: string, jailConfig: object) {
  
}


export enum PlayerInstType {
  HUMAN = "human",
  PROXY = "proxy",
  LOCAL = "local", // NOT USED
}

export interface IPlayerInst {
  type: PlayerInstType;
  id: PlayerInstID;
  name: string;
  tags?: string[];
  prepare(): void;
}

export interface IHumanPlayer extends IPlayerInst {
  type: PlayerInstType.HUMAN;
}

export interface Code {
  lang: string;
  filename: string;
  version: string;
  tags: string[];
  src: string;
  pipeline_name?: string;
  [key: string]: any;
}

export interface IBotPlayer extends IPlayerInst {
  type: PlayerInstType.PROXY;
  code: Code;
}


