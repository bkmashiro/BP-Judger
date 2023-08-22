import { IPlayerFacade, PlayerFacade } from "../../player/entities/playerFacade.entity"
import { GameruleFacade } from "../../gamerule/entities/gameruleFacade.entity"
import { Gameover } from "./gameover.entity"
import { Game, GameManager } from "src/game/game"
import { GameRuleName } from "src/game/players/IPlayer"


type GameState = 'setup' | 'preparing' | 'running' | 'finished' | 'error' | 'paused' | 'aborted' | 'unknown'

export class GameFacade {
  uuid: string
  game: Game
  players: IPlayerFacade[]
  gamerule: GameruleFacade
  state: GameState
  error?: string
  gameover?: Gameover
  // [key: string]: any
  constructor(gameRuleName: GameRuleName = 'GameRuleProxy') {
    this.game = GameManager.newGame(gameRuleName)
    this.gamerule = new GameruleFacade() //TODO implement this
  }

  registerPlayer(player: PlayerFacade) {
    this.game.registerPlayer(player.player)
  }

  static fromObject(obj: any): GameFacade {
    const game = new GameFacade()
    game.uuid = obj.uuid
    game.players = obj.players.map((player: any) => PlayerFacade.fromObject(player))
    game.gamerule = GameruleFacade.fromObject(obj.gamerule)
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
