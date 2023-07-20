import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { PlayerManager, IPlayer, PlayerBase } from "./player"
import { GameManager } from "../../../game/game";


export class PlayerModule extends EventEmitter implements IModule {

  gamer: PlayerBase

  async run(with_: object, ctx: object): Promise<object> {
    this.gamer = PlayerManager.newPlayer(with_['playerType'])

    const gameId = with_['gameId']

    if (!GameManager.hasGame(gameId)) {
      throw new Error(`Game ${gameId} not found`)
    }

    const game = GameManager.getGame(gameId)

    game.registerGamer(this.gamer)

    return {
      'status': 'ready',
    }
  }
}