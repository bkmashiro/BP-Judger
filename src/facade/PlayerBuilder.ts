import { PlayerBase } from "src/game/players/PlayerBase"
import { PlayerManager } from "src/game/players/PlayerFactory"



export type PlayerType = "proxy" | "human" | "local" | "noob"

export type PlayerBuilderConfig = {
  playerType: PlayerType
  uuidOverride?: string
}

/**
 * PlayerBuilder
 * 
 * this is used to build a player
 * 
 * player is a entity in game, which behaves like a player
 * 
 * aka implement the Move function
 * 
 *    `Move(context) : Promise<Move>`
 */
export class PlayerBuilder {
  static build(config: PlayerBuilderConfig) {
    const playerType = config.playerType
    const uuidOverride = config.uuidOverride

    let player = PlayerManager.newPlayer(playerType)
    if (uuidOverride) {
      player.ForceSetUUID(uuidOverride) // This is used on purpose
    }

    return player
  }
}