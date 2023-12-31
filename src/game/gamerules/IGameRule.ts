import { GameContext } from "../game"
import { PlayerMoveWarpper } from "../players/IPlayer"

export interface IGameRule {
  validate_game_pre_requirements(ctx: GameContext):  Promise<boolean>
  validate_move_post_requirements(ctx: GameContext, move: PlayerMoveWarpper):  Promise<boolean>
  validate_move(ctx: GameContext, move: PlayerMoveWarpper):  Promise<boolean>
  accept_move(ctx: GameContext, move: PlayerMoveWarpper):  Promise<void>
  init_game(ctx: GameContext):  Promise<void>
}