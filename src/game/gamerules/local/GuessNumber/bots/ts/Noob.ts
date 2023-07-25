import { PlayerMoveWarpper } from "../../../../../../game/players/IPlayer"
import { PlayerBase } from "../../../../../../game/players/PlayerBase"
import { GameContext, MatchContext } from "../../../../../game"

export class Noob extends PlayerBase {
  move(context: MatchContext): Promise<PlayerMoveWarpper> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          'by': this.uuid,
          'move': {
            "guess": 114514,
          },
        })
      }, 200)
    })
  }
}