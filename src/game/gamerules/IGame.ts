import { PlayerMoveWarpper } from "src/pipelining/modules/playerModule/player";
import { GameContext, MatchContext } from "../game";
import { EventEmitter } from "events";

export interface IGameRule {
  validate_game_pre_reqirements(ctx: GameContext): boolean
  validate_move(ctx: GameContext, move: PlayerMoveWarpper): boolean
}

export type IGameRuleConstructor = (new () => GameRuleBase);

export abstract class GameRuleBase extends EventEmitter implements IGameRule {

  ctx: GameContext
  secret: { [key: string]: any } = {}

  abstract validate_game_pre_reqirements(ctx: MatchContext): boolean

  abstract validate_move_post_reqirements(ctx: MatchContext, move: PlayerMoveWarpper): boolean

  abstract validate_move(ctx: MatchContext, move: PlayerMoveWarpper): boolean

  abstract accept_move(ctx: MatchContext, move: PlayerMoveWarpper): void

  /** @deprecated 
   * Never call this yourself
   * DO NOT REMOVE THIS METHOD */ 
  bind_ctx(gameContext: GameContext): void {
    this.ctx = gameContext
  }

  abstract init_game(ctx: MatchContext): void

  whenGameover = new Promise<GameContext>((resolve, reject) => {
    this.on('gameover', (gameContext: GameContext) => {
      resolve(gameContext.gameoverContext)
    })
  })

  validation_failed(ctx: GameContext, reason: string) {
    this.emit('validation_failed', ctx, reason)
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
export const GAME_SHALL_BEGIN = true
export const GAME_SHALL_WAIT = false