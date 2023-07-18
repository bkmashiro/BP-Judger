import { PlayerBase, PlayerMove } from "../modules/playerModule/player"

export class Noob extends PlayerBase {
  move(context: object): Promise<PlayerMove> {
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