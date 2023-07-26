import {EventEmitter} from "events"
import { IPlayer, PlayerMoveWarpper, PlayerStatus } from "./IPlayer"
import { GameContext, MatchContext } from "../game"

export abstract class PlayerBase extends EventEmitter implements IPlayer {
  private _uuid: string
  playerStatus: PlayerStatus = 'offline'

  constructor(uuid: string) {
    super()
    this._uuid = uuid
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
  
  public get uuid() : string {
    return this._uuid
  }
  
  /** @deprecated DONT CALL THIS IF YOU DONT KNOW WHAT ARE YOU DOING */
  public ForceSetUUID(v : string) {
    this._uuid = v
  }
  
}