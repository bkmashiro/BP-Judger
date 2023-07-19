import { randomUUID } from "crypto"
import { GameID, GameName, IPlayer, PlayerID } from "../modules/playerModule/player"
import { GAME_SHALL_BEGIN, GAME_SHALL_OVER, GameRuleBase, IGameRuleConstructor } from "../test-games/IGame"
import { EventEmitter } from "events"

export type GameContext = {
  "gamers": Record<PlayerID, IPlayer>,
  "gameId"?: GameID,
  "gameRule"?: GameRuleBase,
  "gameover"?: boolean,
  "winner"?: PlayerID,
  "gameoverContext"?: any,
  "gameoverReason"?: string,
  "gameStartTime"?: number,
  "gameEndTime"?: number,
  [key: string]: any,
}


export class GameManager {
  static activeGames: Record<GameID, Game> = {}
  static gameRules: Record<GameName, IGameRuleConstructor> = {}

  public static newGame(ganeName: GameName) {
    if (!GameManager.gameRules.hasOwnProperty(ganeName)) {
      throw new Error(`Game ${ganeName} not found`)
    }
    const gameRule = GameManager.gameRules[ganeName]

    const gameId = GameManager.newGameID()
    const game = new Game(gameId, new gameRule())
    GameManager.activeGames[gameId] = game
    return game
  }

  static newGameID() { return randomUUID() }

  static hasGame(gameId: GameID) { return GameManager.activeGames.hasOwnProperty(gameId) }

  static getGame(gameId: GameID) { return GameManager.activeGames[gameId] }

  static registerGameRule(gameName: GameName, gameRule: IGameRuleConstructor) {
    GameManager.gameRules[gameName] = gameRule
  }
}

export const HARD_MAX_GAME_TURNS = 1000
export const GAME_AUTO_BEGIN_WHEN_GAMER_READY = true

export class Game extends EventEmitter {
  gamers: Record<string, IPlayer> = {}
  uuid: string
  gameRule: GameRuleBase
  ctx : GameContext

  constructor(id: string, gameRule: GameRuleBase) {
    super()
    this.uuid = id
    this.gameRule = gameRule

    this.ctx = {
      'gamers': this.gamers,
      'gameId': this.uuid,
    }

    // this is the onlt place to call this!
    this.gameRule.bind_ctx(this.ctx)
  }

  async begin() {
    this.gameRule.init_game(this.ctx)
    this.emit('game-begin', this)
    let turn = 0
    let gameNotOver = true
    while (gameNotOver) {
      if (turn > HARD_MAX_GAME_TURNS) {
        throw new Error(`Game ${this.uuid} turns exceed ${HARD_MAX_GAME_TURNS}`)
      }
      turn += 1
      const moves = []
      for (const gamer of Object.values(this.gamers)) { //TODO, use pick player strategy
        // console.log(`gamer count ${Object.keys(this.gamers).length}`)
        const move = await gamer.move(this.ctx)
        if (!this.gameRule.validate_move(this.ctx, move)) {
          throw new Error(`Game ${this.uuid} invalid move ${JSON.stringify(move)}`)
        }
        moves.push(move)
        this.gameRule.accept_move(this.ctx, move)
        console.log(`gamer ${gamer.uuid} move ${JSON.stringify(move.move)}, now ctx.yaju_value ${this.ctx['yaju_value']}`)
        if (this.gameRule.validate_move_post_reqirements(this.ctx, move) === GAME_SHALL_OVER) {
          gameNotOver = false
          break
        }
      }

      // this.emit('turn', this, moves)
    }

    this.emit('gameover', this.ctx)
  }

  registerGamer(gamer: IPlayer) {
    console.log(`Registering gamer ${gamer.uuid} to game ${this.uuid}`)
    this.gamers[gamer.uuid] = gamer
    this.emit('gamer-registered', gamer)
    if (this.gameRule.validate_game_pre_reqirements(this.ctx) === GAME_SHALL_BEGIN) {
      this.emit('game-ready', this)
      if (GAME_AUTO_BEGIN_WHEN_GAMER_READY) {
        console.log(`game begin when there is ${Object.keys(this.gamers).length} gamers`)
        this.begin()
      }
    }
  }

  toString() {
    return JSON.stringify(this.brief())
  }

  brief() {
    return {
      'uuid': this.uuid,
      'gamers': Object.keys(this.gamers),
      'gameRule': this.gameRule
    }
  }

  whenGameOver = new Promise<GameContext>((resolve, reject) => {
    this.on('gameover', (gameContext: GameContext) => {
      resolve(gameContext)
    })
  })

  whenGameBegin = new Promise<Game>((resolve, reject) => {
    this.on('game-begin', (game: Game) => {
      resolve(game)
    })
  })
  
}

export class GameHost {

}

export interface GamerConstructor {
  new(uuid: string): IPlayer
}
