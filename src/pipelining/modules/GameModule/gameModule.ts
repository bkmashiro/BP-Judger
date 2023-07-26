import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { GameManager } from "../../../game/game";
import { PlayerBase } from "../../../game/players/PlayerBase";
import { PlayerManager } from "../../../game/players/PlayerFactory";


export class GameModule implements IModule {
  async run(with_: object, ctx: object): Promise<Record<string,string>> {
    const gameName = with_['gameName']
    const game = GameManager.newGame(gameName)
    return {
      'status': 'ready',
      'gameId': game.uuid
    }
  }
}