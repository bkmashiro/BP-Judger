import { PlayerProxy, PlayerProxyManager } from "../../../game/players/playerProxy/playerProxy";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { config } from "../../../configs/config";
import { createHash } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'
import { BKPileline, require_procedure } from "../../../pipelining/pipelining";
import { Logger } from "@nestjs/common";
import { FileCache } from "src/pipelining/modules/FileCacheModule/fileCacheModule";
import { CreatePlayerDTO, PreparedPlayerType } from "src/modules/game/dto/create-game.dto";
import { FileHelper, createCodeFingerprint } from "src/utils";
import { PlayerBase } from "src/game/players/PlayerBase";
import { BotConfig } from "src/modules/bot/entities/bot.entity";
import { Executables } from "src/executables/executables";

export type PlayerFacadeID = string
const logger = new Logger('PlayerFacade')
export class PlayerFacade {
  type: PlayerFacadeType
  tags: string[]
  code?: Code
  player: PlayerBase


  static fromObject(player: CreatePlayerDTO): PlayerFacade {
    if (player.type === 'proxy') {
      return PlayerFacade.new(
        player.type,
        {
          tags: [], //TODO check this
          code: {
            lang: player.exec.config.lang,
            filename: player.exec.config.filename, // this is not used
            version: player.exec.config.version,
            src: player.exec.source,
          }
        }
      )
    } else {
      throw new Error('Not implemented')
    }
  }

  static new(type: 'proxy' | 'human', config: Pick<BotConfig, 'tags' | 'code'>) {
    const player = new PlayerFacade()
    if (type === 'proxy') {
      player.type = PlayerFacadeType.PROXY
      player.player = PlayerProxyManager.instance.newPlayer()
      player.tags = config.tags
      player.code = config.code
    } else if (type === 'human') {
      throw new Error('Not implemented')
    } else {
      throw new Error('Unknown player type')
    }

    return player
  }

  public get id(): string {
    return this.player.uuid
  }

  async prepare(): Promise<PreparedPlayerType> {
    const startegy = prepare_strategy[this.type]
    if (startegy) {
      return await startegy.call(this, this)
    }
    throw new Error('Unknown player type or strategy not implemented')
  }
}

async function prepare_proxy_player_test({ code }: PlayerFacade): Promise<PreparedPlayerType> {
  // 1. prepare code file
  // 2. compile (if needed)
  // const executable = await prepare_code(code)
  const executable = await Executables.prepare({
    source: code.src,
    config: {
      lang: code.lang,
      version: code.version,
    }
  })

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
  [PlayerFacadeType.PROXY]: prepare_proxy_player_test,
  [PlayerFacadeType.HUMAN]: null, //TODO implement this
  [PlayerFacadeType.LOCAL]: null, //TODO implement this
}


async function prepare_code(code: Code): Promise<string> {
  if (!code) throw new Error('Code not found')

  const code_fingerprint = createCodeFingerprint(code)
  if (await FileCache.instance.has(code_fingerprint)) { // if cached, skip compile
    const codeOutPath = await FileCache.instance.get(code_fingerprint)
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
  // tags: string[];
  src: string;
  pipeline_name?: string;
  [key: string]: any;
}
export interface IBotPlayer extends IPlayerFacade {
  type: PlayerFacadeType.PROXY;
  code: Code;
}


