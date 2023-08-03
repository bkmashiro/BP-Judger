import { IPlayerInst, PlayerInstance } from "../../player/entities/player.entity"
import { GameruleInstance } from "../../gamerule/entities/gamerule.entity"
import { Gameover } from "./gameover.entity"
import { Entity } from "typeorm"


type GameState = 'setup' | 'preparing' | 'running' | 'finished' | 'error' | 'paused' | 'aborted' | 'unknown'

export class Game {
  uuid: string
  players: IPlayerInst[]
  gamerule: GameruleInstance
  state: GameState
  error?: string
  gameover?: Gameover
  // [key: string]: any

  static fromObject(obj: any): Game {
    const game = new Game()
    game.uuid = obj.uuid
    game.players = obj.players.map((player: any) => PlayerInstance.fromObject(player))
    game.gamerule = GameruleInstance.fromObject(obj.gamerule)
    game.state = obj.state
    game.error = obj.error
    game.gameover = obj.gameover
    return game
  }

  prepare() {
    this.state = 'preparing'
    this.gamerule.prepare()
    this.players.forEach(player => player.prepare())
  }
}
