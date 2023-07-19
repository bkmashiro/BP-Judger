import { EventEmitter } from "stream";
import { GAME_SHALL_OVER, GAME_SHALL_CONTINUE, GameRuleBase, IGameRule, IGameRuleConstructor, GAME_SHALL_WAIT, GAME_SHALL_BEGIN } from "./IGame";
import { PlayerMove } from "../modules/playerModule/player";
import { GameContext } from "../game/game";

export class TestGame extends GameRuleBase {
  accept_move(gameContext: object, move: PlayerMove): void {
    gameContext['yaju_value'] += move['move']['inc']
  }

  validate_move_post_reqirements(gameContext: GameContext, move: PlayerMove): boolean {
    if(gameContext['yaju_value'] > 1919810){
      this.winnerIs(move.by).gameover()
      return GAME_SHALL_OVER
    }
    return GAME_SHALL_CONTINUE
  }

  init_game(gameContext: GameContext): void {
    gameContext['yaju_value'] = 114514
  }

  validate_game_pre_reqirements(gameContext: GameContext): boolean {
    // gamer is a Record
    if(Object.keys(gameContext['gamers']).length === 2) {
      return GAME_SHALL_BEGIN
    }
    return GAME_SHALL_WAIT;
  }

  validate_move(gameContext: object, move: PlayerMove): boolean {
    if (move['move']["inc"] > 0) {
      return true
    }
    return false
  }
}