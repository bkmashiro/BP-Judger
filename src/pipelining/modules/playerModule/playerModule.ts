import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { GameManager } from "../../../game/game";
import { PlayerBase } from "../../../game/players/PlayerBase";
import { PlayerManager } from "../../../game/players/PlayerFactory";


export class PlayerModule implements IModule {
  async run(with_: object, ctx: object) {
    const gamer = PlayerManager.newPlayer(with_['playerType'])

    const gameId = with_['gameId']

    if (!GameManager.hasGame(gameId)) {
      throw new Error(`Game ${gameId} not found`)
    }

    const game = GameManager.getGame(gameId)

    game.registerGamer(gamer)

    return {
      __code__: 0,
      playerId: gamer.uuid,
    }
  }
}