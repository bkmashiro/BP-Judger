import { GAME_SHALL_OVER, GAME_SHALL_CONTINUE, GameRuleBase, IGameRule, IGameRuleConstructor, GAME_SHALL_WAIT, GAME_SHALL_BEGIN } from "../IGame";
import { MatchContext } from "../../game";
import { All } from "../../../utils";
import { PlayerMove, PlayerMoveWarpper } from "../../../pipelining/modules/playerModule/player";

export class GuessNumberGame extends GameRuleBase {
  accept_move(ctx: MatchContext, move: PlayerMove): void {
    ctx['moves'].push({
      move: move,
      compare_result: this.compare_number(move['guess'], this.secret['target'])
    })
  }

  compare_number(a: number, b: number){
    if(a > b) return '>'
    if(a < b) return '<'
    return '='
  }

  validate_move_post_reqirements(ctx: MatchContext, move: PlayerMoveWarpper): boolean {
    if(move.move['guess'] === this.secret['target']){
      this.winnerIs(move.by).gameover()
      return GAME_SHALL_OVER
    }
    return GAME_SHALL_CONTINUE
  }

  init_game(ctx: MatchContext): void {
    this.secret['target'] = 114514
    ctx['moves'] = []
  }

  validate_game_pre_reqirements(ctx: MatchContext): boolean {
    if(ctx['players'].size === 1 && All(ctx['players'].values(), (gamer) => gamer.playerStatus === 'ready')) {
      return GAME_SHALL_BEGIN
    }
    return GAME_SHALL_WAIT;
  }

  validate_move(ctx: MatchContext, move: PlayerMove): boolean {
    if (move.hasOwnProperty('guess')) {
      return true
    }
    return false
  }
}