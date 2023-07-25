import { GamerConstructor } from "../game"
import { IPlayerConstructor } from "./IPlayer"
import { PlayerBase } from "./PlayerBase"

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
