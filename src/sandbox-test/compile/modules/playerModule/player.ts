import { randomUUID } from "crypto"
import { EventEmitter } from "events";
import { GAME_SHALL_OVER, GameRuleBase, IGameRuleConstructor } from "../../test-games/IGame";
import { GameContext, GamerConstructor } from "../../game/game";

export type IPlayerConstructor = (new (uuid: string) => PlayerBase);

export interface IPlayer {
  uuid: string
  move(context: GameContext): Promise<PlayerMove>
}



export type PlayerMove = {
  'by': PlayerID,
  'move': any,
}

export type GameID = string
export type PlayerID = string
export type GameName = string

export abstract class PlayerBase extends EventEmitter implements IPlayer {
  uuid: string
  constructor(uuid: string) {
    super()
    this.uuid = uuid
  }
  abstract move(context: object): Promise<PlayerMove> 
}



export class PlayerManager {
  static GamerType: Record<string, GamerConstructor> = {}
  static newGamerID() { return randomUUID() }
  static newGamer(gamerTypeStr: string) {
    if (!PlayerManager.GamerType.hasOwnProperty(gamerTypeStr)) {
      throw new Error(`Gamer type ${gamerTypeStr} not found`)
    }
    const gType = PlayerManager.GamerType[gamerTypeStr]
    const uuid = PlayerManager.newGamerID()
    const gamer = new gType(uuid)
    return gamer
  }
  static registerGamerType(name: string, gamer: IPlayerConstructor) {
    PlayerManager.GamerType[name] = gamer
  }
}
