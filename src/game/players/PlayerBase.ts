import {EventEmitter} from "events"
import { IPlayer, PlayerMoveWarpper, PlayerStatus } from "./IPlayer"
import { GameContext, MatchContext } from "../game"

export abstract class PlayerBase extends EventEmitter implements IPlayer {
  private _uuid: string
  status: PlayerStatus = 'unset'

  constructor(uuid: string) {
    super()
    this._uuid = uuid
  }

  abstract move(context: MatchContext): Promise<PlayerMoveWarpper> 

  onGameover(gameContext: GameContext) {}

  //TODO Use finite state machine to control the status of the player
  setStatus(status: PlayerStatus) {
    if(this.status === status) {
      return
    }
    if (this.status === 'playing' && status==='ready') {
      return
    }


    this.status = status

    console.log(`Player ${this.uuid} status changed to ${status}`)
    this.emit('status-change', status)
  }
  
  public get uuid() : string {
    return this._uuid
  }
  
  /** @deprecated DONT CALL THIS IF YOU DONT KNOW WHAT ARE YOU DOING */
  public ForceSetUUID(v : string) {
    this._uuid = v
  }
  
  
  public get ready() : boolean {
    return this.status === 'ready'
  }
  

}