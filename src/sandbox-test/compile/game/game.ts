import { randomUUID } from "crypto"
import { GameID, GameName, IPlayer, PlayerBase, PlayerID } from "../modules/playerModule/player"
import { GAME_SHALL_BEGIN, GAME_SHALL_OVER, GameRuleBase, IGameRuleConstructor } from "../test-games/IGame"
import { EventEmitter } from "events"

export type GameContext = {
  "players": Map<PlayerID, IPlayer>,
  "gameId"?: GameID,
  "gameRule"?: GameRuleBase,
  "gameover"?: boolean,
  "winner"?: PlayerID,
  "gameoverContext"?: any,
  "gameoverReason"?: string,
  "gameStartTime"?: number,
  "gameEndTime"?: number,
  "matchCtx": MatchContext
  [key: string]: any,
}


export type MatchContext = {
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
export type GAMESTATE = 'organizing' | 'ready' | 'running' | 'gameover' | 'error'


export class Game extends EventEmitter {
  players: Map<string, IPlayer> = new Map()
  uuid: string
  gameRule: GameRuleBase
  game_ctx: GameContext   // as a game context
  match_ctx: MatchContext = {} // to send to player 
  state: GAMESTATE = 'organizing'

  constructor(id: string, gameRule: GameRuleBase) {
    super()
    this.uuid = id
    this.gameRule = gameRule

    this.game_ctx = {
      players: this.players,
      gameId: this.uuid,
      matchCtx: this.match_ctx,
    }


    // this is the onlt place to call this!
    this.gameRule.bind_ctx(this.game_ctx)

    this.on('status-change', () => {
      // console.log(`game ${this.uuid} status change, is ready? ${this.Ready}, state ${this.state}`)
      if (this.Ready && this.state === 'organizing') {
        this.emit('game-ready', this)
        if (GAME_AUTO_BEGIN_WHEN_GAMER_READY) {
          console.log(`game ${this.uuid} begin`)
          this.begin()
        }
      }
    })
  }

  async begin() {
    this.gameRule.init_game(this.match_ctx)
    this.emit('game-begin', this)
    this.setState('running')
    // this.gameBeginCb(this)
    let turn = 0
    let gameNotOver = true
    while (gameNotOver) {
      if (turn > HARD_MAX_GAME_TURNS) {
        throw new Error(`Game ${this.uuid} turns exceed ${HARD_MAX_GAME_TURNS}`)
      }
      turn += 1
      const moves = []
      for (const [playerId, player] of this.players) {
        const moveWarpper = (await player.move(this.match_ctx)) // TODO: make validation, and do not use magic string
        const move = moveWarpper['move'] // TODO: make validation, and do not use magic string

        console.debug(`moveWarpper: ${JSON.stringify(moveWarpper)}`)

        if (!this.gameRule.validate_move(this.match_ctx, move)) {
          throw new Error(`Game ${this.uuid} invalid move ${JSON.stringify(move)}`)
        }
        moves.push(move)
        this.gameRule.accept_move(this.match_ctx, move)
        if (this.gameRule.validate_move_post_reqirements(this.match_ctx, moveWarpper) === GAME_SHALL_OVER) {
          gameNotOver = false
          break
        }
      }

      // this.emit('turn', this, moves)
    }
    this.setState('gameover')

    // close all player
    for (const [playerId, player] of this.players) {
      (player as PlayerBase).onGameover(this.game_ctx)
    }

    console.log(this.gameoverCb)
    this.gameoverCb(this.game_ctx)
  }

  registerGamer(gamer: PlayerBase) {
    this.players.set(gamer.uuid, gamer)
    console.log(`player ${gamer.uuid} registered and waiting`)
    this.emit('player-registered', gamer)
    this.emit('status-change')
    gamer.on('status-change', (status: string) => {
      this.emit('status-change')
      this.emit('player-status-change', gamer, status)
    })
  }

  toString() {
    return JSON.stringify(this.brief())
  }

  brief() {
    return {
      'uuid': this.uuid,
      'players': Object.keys(this.players),
      'gameRule': this.gameRule
    }
  }

  setState(state: GAMESTATE) {
    this.state = state
    this.emit('state-change', state)
  }

  gameoverCb: (gameCtx: GameContext) => void

  whenGameOver() {
    return new Promise<GameContext>((resolve, reject) => {
      this.gameoverCb = resolve
    })
  }

  // gameBeginCb: (game: Game) => void
  // gameBeginPromise: Promise<Game> = new Promise((resolve, reject) => {
  //   this.gameBeginCb = resolve
  // })

  // whenGameBegin() {
  //   return this.gameBeginPromise
  // }





  public get Ready(): boolean {
    return this.gameRule.validate_game_pre_reqirements(this.game_ctx) === GAME_SHALL_BEGIN
  }

}

export class GameHost {

}

export interface GamerConstructor {
  new(uuid: string): IPlayer
}
