import { MatchContext } from "../../../game";
import { All } from "../../../../utils";
import { GameRuleBase, GAME_SHALL_OVER, GAME_SHALL_CONTINUE, GAME_SHALL_BEGIN, GAME_SHALL_WAIT } from "../../GameRuleBase";
import { PlayerMoveWarpper } from "../../../../game/players/IPlayer";

export class GuessNumberGame extends GameRuleBase {

  async accept_move(ctx: MatchContext, move: PlayerMoveWarpper) {
    ctx['moves'].push({
      move: move.move,
      compare_result: this.compare_number(move.move['guess'], this.secret['target'])
    })
  }

  compare_number(a: number, b: number){
    if(a > b) return '>'
    if(a < b) return '<'
    return '='
  }

  async validate_move_post_requirements(ctx: MatchContext, move: PlayerMoveWarpper) {
    if(move.move['guess'] === this.secret['target']){
      this.winnerIs(move.by).gameover()
      return GAME_SHALL_OVER
    }
    return GAME_SHALL_CONTINUE
  }

  async init_game(ctx: MatchContext) {
    this.secret['target'] = 114514
    ctx['moves'] = []
  }

  async validate_game_pre_requirements(ctx: MatchContext) {
    // console.log(ctx.players)
    // console.log(`players size is ${ctx['players'].size}`)
    if(Object.keys(ctx['players']).length && All(Object.values(ctx['players']), (gamer) => gamer.playerStatus === 'ready')) {
      return GAME_SHALL_BEGIN
    }
    return GAME_SHALL_WAIT;
  }

  async validate_move(ctx: MatchContext, move: PlayerMoveWarpper) {
    if (move.move.hasOwnProperty('guess')) {
      return true
    }
    return false
  }
}