import { randomUUID } from "crypto"
import { EventEmitter } from "events";
import { GAME_SHALL_OVER, GameRuleBase, IGameRuleConstructor } from "../../test-games/IGame";

export type IPlayerConstructor = (new (uuid: string) => PlayerBase);

export interface IPlayer {
  uuid: string
  move(context: GameContext): Promise<PlayerMove>
}

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

export type PlayerMove = {
  'by': PlayerID,
  'move': any,
}

export type GameID = string
export type PlayerID = string
export type GameName = string

export abstract class PlayerBase extends EventEmitter implements IPlayer {
  uuid: string
  constructor(uuid: string) {
    super()
    this.uuid = uuid
  }
  abstract move(context: object): Promise<PlayerMove> 
}



export class PlayerManager {
  static GamerType: Record<string, GamerConstructor> = {}
  static newGamerID() { return randomUUID() }
  static newGamer(gamerTypeStr: string) {
    if (!PlayerManager.GamerType.hasOwnProperty(gamerTypeStr)) {
      throw new Error(`Gamer type ${gamerTypeStr} not found`)
    }
    const gType = PlayerManager.GamerType[gamerTypeStr]
    const uuid = PlayerManager.newGamerID()
    const gamer = new gType(uuid)
    return gamer
  }
  static registerGamerType(name: string, gamer: IPlayerConstructor) {
    PlayerManager.GamerType[name] = gamer
  }
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
    if (this.gameRule.validate_game_pre_reqirements(this.ctx)) {
      this.emit('game-ready', this)
      if (GAME_AUTO_BEGIN_WHEN_GAMER_READY) {
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

  whenGameover = new Promise<GameContext>((resolve, reject) => {
    this.on('gameover', (gameContext: GameContext) => {
      resolve(gameContext)
    })
  })
  
}

export class GameHost {

}

export interface GamerConstructor {
  new(uuid: string): IPlayer
}
