import { GameruleID } from "../../gamerule/entities/gamerule.entity"
import { PlayerID } from "../../player/entities/player.entity"

export class CreateGameDto {
  gameruleId: GameruleID
  players: (BotType | HumanType)[]
  configs: {
    [key: string]: any
  }
}

export type BotType = {
  type: 'bot'
  botId: number
}

export type HumanType = {
  type: 'human'
  human: number
}