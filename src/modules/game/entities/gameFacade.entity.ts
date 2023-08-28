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
  /**
   * This is the **POST-CHECK** timeout for the game, that is
   * After one action is completed, the game will check if the time is exceeded,
   * if the limitation is exceeded, a error will be thrown.
   * 
   * Note that, even a action has timed out, the config here won't immediately stop it,
   * it will be stopped after the action is completed. (it's when it emits a mark)
   * 
   * if you need a hard timeout, it's set in [TODO]
   */
  timeouts: {
    /** in ms, the maxium time player can think (per move query) */
    think: number 
    /** 
     * @deprecated
     * in ms, the maxium time to prepare, this is commonly used in programs that need compiling 
     * 
     * key: player identifier
     * 
     * value: max time comsumption 
    */
    prepare: {
      [key: string]: number 
    }
    run: number
    all: number
  }
}