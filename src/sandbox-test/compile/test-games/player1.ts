import { GameContext, MatchContext } from "../game/game"
import { PlayerBase, PlayerMoveWarpper } from "../modules/playerModule/player"

export class Noob extends PlayerBase {
  move(context: MatchContext): Promise<PlayerMoveWarpper> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          'by': this.uuid,
          'move': {
            "inc": Math.random() * 500000,
          },
        })
      }, 200)
    })
  }
}