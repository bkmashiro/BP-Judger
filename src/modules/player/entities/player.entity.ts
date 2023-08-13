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
const logger = new Logger('PlayerFacade')
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
    const startegy = prepare_strategy[this.type]
    if (startegy) { 
      return await startegy.call(this, this)
    } 
    throw new Error('Unknown player type or strategy not implemented')
  }
}

async function prepare_proxy_player({ code }: PlayerFacade) :Promise<PreparedPlayerType> {
  // 1. prepare code file
  // 2. compile (if needed)
  const executable = await prepare_code(code)

  return {
    type: 'bot',
    botId: this.id,
    execPath: executable,
  }
}

export enum PlayerFacadeType {
  HUMAN = "human",
  PROXY = "proxy",
  LOCAL = "local", // NOT USED
}

const prepare_strategy = {
  [PlayerFacadeType.PROXY]: prepare_proxy_player,
  [PlayerFacadeType.HUMAN]: null,
  [PlayerFacadeType.LOCAL]: null,
}


async function prepare_code(code :Code) :Promise<string> {
  if (!code) throw new Error('Code not found')
  
  const code_fingerprint = createCodeFingerprint(code)
  if (await FileCache.instance.has(code_fingerprint)) { // if cached, skip compile
    const codeOutPath = await FileCache.instance.get(code_fingerprint)
    // console.log(`Code ${code_fingerprint} hit cache ${codeOutPath}`)
    return codeOutPath
  }

  const basePath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, code_fingerprint))
  const codePath = path.resolve(path.join(basePath, code.filename))
  const codeOutPath = path.resolve(path.join(basePath, `/cmake/build/test`))
  console.log(codeOutPath)
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

  return codeOutPath
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


