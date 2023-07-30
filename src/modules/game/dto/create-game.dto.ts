import { GameruleID } from "../../gamerule/entities/gamerule.entity"
import { PlayerID } from "../../player/entities/player.entity"

export class CreateGameDto {
  gameruleUUID: GameruleID
  players: PlayerID[]
  configs: {
    [key: string]: any
  }
}
