import { IPlayerFacade, PlayerFacade } from "../../player/entities/playerFacade.entity"
import { GameruleFacade } from "../../gamerule/entities/gameruleFacade.entity"
import { Gameover } from "./gameover.entity"
import { GAMESTATE, Game, GameManager } from "src/game/game"
import { GameRuleName } from "src/game/players/IPlayer"
import { Timely } from "src/utils/timely"


type GameState = 'setup' | 'preparing' | 'running' | 'finished' | 'error' | 'paused' | 'aborted' | 'unknown'

export class GameFacade {
  uuid: string
  game: Game
  players: IPlayerFacade[]
  gamerule: GameruleFacade 
  error?: string
  gameover?: Gameover


  constructor(gameRuleName: GameRuleName = 'GameRuleProxy') {
    this.game = GameManager.newGame(gameRuleName)
    this.gamerule = new GameruleFacade() //TODO implement this
  }

  registerPlayer(player: PlayerFacade) {
    this.game.registerPlayer(player.player)
  }

  registerPlayers(players: PlayerFacade[]) {
    for (const player of players) {
      this.registerPlayer(player)
    }
  }

  static fromObject(obj): GameFacade {
    const game = new GameFacade()
    game.uuid = obj.uuid
    game.players = obj.players.map((player: any) => PlayerFacade.fromObject(player))
    game.gamerule = GameruleFacade.fromObject(obj.gamerule)


    return game
  }
  
  public get state() : GAMESTATE {
    return this.game.state
  }

  set state(state: GAMESTATE) {
    this.game.state = state
  }
  
  prepare() {
    this.state = 'organizing'
    this.gamerule.prepare()
    this.players.forEach(player => player.prepare())
  }
}


export type GameConfig = {
  timeouts: {
    think: number
    prepare: number
    run: number
    all: number
  }
}