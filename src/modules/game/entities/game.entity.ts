import { IPlayer, Player } from "../../player/entities/player.entity"
import { Gamerule } from "../../gamerule/entities/gamerule.entity"
import { Gameover } from "./gameover.entity"


type GameState = 'setup' | 'preparing' | 'running' | 'finished' | 'error' | 'paused' | 'aborted' | 'unknown'

export class Game {
  uuid: string
  players: IPlayer[]
  gamerule: Gamerule
  state: GameState
  error?: string
  gameover?: Gameover
  // [key: string]: any

  static fromObject(obj: any): Game {
    const game = new Game()
    game.uuid = obj.uuid
    game.players = obj.players.map((player: any) => Player.fromObject(player))
    game.gamerule = Gamerule.fromObject(obj.gamerule)
    game.state = obj.state
    game.error = obj.error
    game.gameover = obj.gameover
    return game
  }
}
