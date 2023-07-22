import { randomUUID } from "crypto"
import { EventEmitter } from "events";
import { GameContext, GamerConstructor, MatchContext } from "src/game/game";

export type IPlayerConstructor = (new (uuid: string) => PlayerBase);

export interface IPlayer {
  uuid: string
  move(context: MatchContext): Promise<PlayerMoveWarpper>
  playerStatus: PlayerStatus 
}

export type PlayerMoveWarpper = {
  'by': PlayerID,
  'move': PlayerMove,
}

export type PlayerMove = any

export type GameID = string
export type PlayerID = string
export type GameName = string
export type PlayerStatus = 'online' | 'offline' | 'playing' | 'waiting' | 'ready'

export abstract class PlayerBase extends EventEmitter implements IPlayer {
  uuid: string
  playerStatus: PlayerStatus = 'offline'

  constructor(uuid: string) {
    super()
    this.uuid = uuid
  }
  abstract move(context: MatchContext): Promise<PlayerMoveWarpper> 

  onGameover(gameContext: GameContext) {}

  setStatus(status: PlayerStatus) {
    if(this.playerStatus === status) {
      return
    }

    this.playerStatus = status
    this.emit('status-change', status)
  }
}

export class PlayerManager {
  static GamerType: Record<string, GamerConstructor | PlayerFactory> = {}
  static newplayerID() { 
    // return randomUUID()
    return `d9668c37-6c28-4b46-8c88-6d550da1410d`
  }
  static newPlayer(gamerTypeStr: string) : PlayerBase {
    if (!PlayerManager.GamerType.hasOwnProperty(gamerTypeStr)) {
      throw new Error(`Gamer type ${gamerTypeStr} not found`)
    }
    const gType = PlayerManager.GamerType[gamerTypeStr]
    const uuid = PlayerManager.newplayerID()
    if(gType instanceof PlayerFactory) {
      return gType.newPlayer(uuid)
    } else {
      return new gType(uuid) as PlayerBase
    }
  }

  static registerGamerType(name: string, gamer: IPlayerConstructor | PlayerFactory) {
    PlayerManager.GamerType[name] = gamer
  }
}

export abstract class PlayerFactory {
  abstract newPlayer(uuid: string): PlayerBase
}
