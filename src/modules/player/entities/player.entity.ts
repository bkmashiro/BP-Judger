import { PlayerProxyManager } from "../../../game/players/playerProxy/playerProxy";
import { CreatePlayerDto } from "../dto/create-player.dto";
import { CODE_FILE_TEMP_DIR } from "../../../configs/config";
import { createHash } from 'crypto'
import path from "path";
import fs from "fs";
import { BKPileline, require_procedure } from "../../../pipelining/pipelining";
import { basic_jail_config } from "src/jail/NsjailRush";

export type PlayerID = string

export class Player {
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

  static newProxyPlayer(name: string, tags: string[], code: Code): Player {
    const player = new Player()
    const proxy = Player.proxyPlayerManager.newPlayer()
    player.id = proxy.uuid
    player.type = PlayerType.PROXY
    player.name = name
    player.tags = tags

    //get code hash
    const codeHash = createHash('md5').update(code.source).digest('hex')
    // write code to file
    const dir = CODE_FILE_TEMP_DIR
    const filename = `${player.id}-${codeHash.substring(0, 8)}`
    const filepath = path.resolve(dir, filename)

    fs.writeFileSync(filepath, code.source)

    // Use pipeline to compile and run code

    // Use predefined config
    // const pipeline = BKPileline.fromConfig(
    //   BKPileline.getConfig('g++2')
    // )
    // Or use custom config
    const pipeline = new BKPileline({
      jobs:[
        require_procedure('proxy-player-setup').named("proxyPlayer").compile(),
        require_procedure('c++11').compile({
          in_file_name: filepath,
          out_file_name: `${filename}.out`,
        }),
        require_procedure('execute-jailed').compile({
          file: `${filename}.out`,
          args: ["proxyPlayer.playerId"],
          jail: basic_jail_config
        })
      ],
    })



    return player
  }
}

export enum PlayerType {
  HUMAN = "human",
  PROXY = "proxy",
  LOCAL = "local", // NOT USED
}

export interface IPlayer {
  type: PlayerType;
  uuid: string;
  name: string;
  tags?: string[];
  fromObject(obj: any): IPlayer;
}

export interface IHumanPlayer extends IPlayer {
  type: PlayerType.HUMAN;
}

export interface Code {
  name: string;
  version: string;
  tags: string[];
  source: string;
  [key: string]: any;
}

export interface IBotPlayer extends IPlayer {
  type: PlayerType.PROXY;
  code: Code;
}


