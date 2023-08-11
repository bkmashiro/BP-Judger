import { PlayerProxy, PlayerProxyManager } from "../../../game/players/playerProxy/playerProxy";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { config } from "../../../configs/config";
import { createHash } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'
import { BKPileline, require_procedure } from "../../../pipelining/pipelining";
import { Logger } from "@nestjs/common";
import { FileCache } from "src/pipelining/modules/FileCacheModule/fileCacheModule";
import { PreparedPlayerType } from "src/modules/game/dto/create-game.dto";
import { FileHelper, createCodeFingerprint } from "src/utils";

export type PlayerFacadeID = string

export class PlayerFacade implements IPlayerFacade {
  type: PlayerFacadeType
  name: string
  tags: string[]
  code?: Code
  proxy?: PlayerProxy
  

  static fromObject(player: CreatePlayerDto): PlayerFacade {
    const newPlayer = new PlayerFacade()
    // TODO
    throw new Error("Method not implemented.");
    return newPlayer
  }
  

  static async ProxyPlayer(name: string, tags: string[], code: Code): Promise<PlayerFacade> {
    const player = new PlayerFacade()
    player.type = PlayerFacadeType.PROXY
    player.proxy = PlayerProxyManager.instance.newPlayer()
    player.name = name
    player.tags = tags
    player.code = code
    return player
  }

  
  public get id() : string {
    if (this.type === PlayerFacadeType.PROXY) {
      return this.proxy.uuid
    }

    throw new Error('Unknown player type')
  }
  

  async prepare(): Promise<PreparedPlayerType> {
    if (this.type === PlayerFacadeType.PROXY) {
      const execPath = await prepare_proxy_player(this)
      Logger.log(`Player ${this.id} prepared at ${execPath}`)
      return {
        type: 'bot',
        botId: this.id,
        execPath,
      }
    } else if (this.type === PlayerFacadeType.HUMAN) {

    } else if (this.type === PlayerFacadeType.LOCAL) {

    } else {
      throw new Error('Unknown player type')
    }
  }
}
// TODO: clean this
// TODO: use strategy pattern
async function prepare_proxy_player({ code }: PlayerFacade) :Promise<string> {
  // 1. prepare code file
  // 2. compile (if needed)
  
  const executable = prepare_code(code)



  return executable
}



async function prepare_code(code :Code) {
  if (!code) throw new Error('Code not found')
  
  const code_fingerprint = createCodeFingerprint(code)
  if (await FileCache.instance.has(code_fingerprint)) { // if cached, skip compile
    const codeOutPath = await FileCache.instance.get(code_fingerprint)
    return codeOutPath
  }

  const basePath = path.resolve(config.CODE_FILE_TEMP_DIR, code_fingerprint)
  const codePath = path.resolve(basePath, code.filename)
  const codeOutPath = path.resolve(basePath, `/cmake/build/test`)
  //TODO add error handling
  await new FileHelper()
    .push('mkdir', basePath)
    .push('write', codePath, code.src)
    .push('chown', codePath, config.uid, config.gid)
    .push('chgrp', codePath, config.uid, config.gid)
    .run()

  await BKPileline.fromJobs(
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
}


export enum PlayerFacadeType {
  HUMAN = "human",
  PROXY = "proxy",
  LOCAL = "local", // NOT USED
}

export interface IPlayerFacade {
  type: PlayerFacadeType;
  id: PlayerFacadeID;
  name: string;
  tags?: string[];
  prepare(): void;
}

export interface IHumanPlayer extends IPlayerFacade {
  type: PlayerFacadeType.HUMAN;
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

export interface IBotPlayer extends IPlayerFacade {
  type: PlayerFacadeType.PROXY;
  code: Code;
}


