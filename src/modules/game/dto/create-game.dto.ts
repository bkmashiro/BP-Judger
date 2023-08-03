import { GameruleID } from "../../gamerule/entities/gamerule.entity"
import { PlayerInstID } from "../../player/entities/player.entity"

export class CreateGameDto {
  gameruleId: number
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

export type BotPreparedType = {
  type: 'bot'
  botId: PlayerInstID
  execPath: string
}

export type HumanPreparedType = {
  type: 'human'
  human: PlayerInstID
  socket: any
}

export type PreparedPlayerType = BotPreparedType | HumanPreparedType