import { PlayerBase, PlayerMoveWarpper } from "../../../../../pipelining/modules/playerModule/player"
import { GameContext, MatchContext } from "../../../../game"

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