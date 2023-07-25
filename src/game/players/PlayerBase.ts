import {EventEmitter} from "events"
import { IPlayer, PlayerMoveWarpper, PlayerStatus } from "./IPlayer"
import { GameContext, MatchContext } from "../game"

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