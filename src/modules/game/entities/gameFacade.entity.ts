import { IPlayerFacade, PlayerFacade } from "../../player/entities/playerFacade.entity"
import { GameruleFacade } from "../../gamerule/entities/gameruleFacade.entity"
import { Gameover } from "./gameover.entity"
import { Entity } from "typeorm"
import { GameManager } from "src/game/game"
import { GameRuleProxy } from "src/game/gamerules/gameruleProxy/GameRuleProxy"


type GameState = 'setup' | 'preparing' | 'running' | 'finished' | 'error' | 'paused' | 'aborted' | 'unknown'

export class GameFacade {
  uuid: string
  players: IPlayerFacade[]
  gamerule: GameruleFacade
  state: GameState
  error?: string
  gameover?: Gameover
  // [key: string]: any
  constructor(gameRuleName: string = 'GameRuleProxy') {
    const gameInst = GameManager.newGame(gameRuleName)
    const gameRuleInstance = gameInst.gameRule as GameRuleProxy
    const gameRuleInstanceUUID = gameRuleInstance.gameId
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
