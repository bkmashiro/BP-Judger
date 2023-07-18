import { GameContext, PlayerMove } from "../modules/playerModule/player";
import { EventEmitter } from "events";

export interface IGameRule {
  validate_game_pre_reqirements(gameContext: object): boolean
  validate_move(gameContext: object, move: PlayerMove): boolean
}

export type IGameRuleConstructor = (new () => GameRuleBase);

export abstract class GameRuleBase extends EventEmitter implements IGameRule {

  ctx: GameContext
  abstract validate_game_pre_reqirements(gameContext: object): boolean

  abstract validate_move_post_reqirements(gameContext: object, move: PlayerMove): boolean

  abstract validate_move(gameContext: object, move: PlayerMove): boolean

  abstract accept_move(gameContext: object, move: PlayerMove): void

  /** @deprecated 
   * Never call this yourself
   * DO NOT REMOVE THIS METHOD */ 
  bind_ctx(gameContext: GameContext): void {
    this.ctx = gameContext
  }

  abstract init_game(gameContext: GameContext): void

  whenGameover = new Promise<GameContext>((resolve, reject) => {
    this.on('gameover', (gameContext: GameContext) => {
      resolve(gameContext.gameoverContext)
    })
  })

  validation_failed(gameContext: GameContext, reason: string) {
    this.emit('validation_failed', gameContext, reason)
  }

  winnerIs(winner: string) {
    this.ctx.winner = winner
    return this
  }

  gameover() {
    this.ctx.gameover = true
    this.emit('gameover', this.ctx)
    return this
  }
}

export const GAME_SHALL_OVER = false
export const GAME_SHALL_CONTINUE = true
export const GAME_SHALL_BEGIN = false
export const GAME_SHALL_WAIT = true