import { GameruleID } from "../../gamerule/entities/gamerule.entity"
import { PlayerFacadeID } from "../../player/entities/player.entity"

export class CreateGameDto_test {
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
  botId: PlayerFacadeID
  execPath: string
}

export type HumanPreparedType = {
  type: 'human'
  human: PlayerFacadeID
  socket: any
}

export type PreparedPlayerType = BotPreparedType | HumanPreparedType

export type ExecutableConfig = {
  language: string
  version: string
  [key: string]: any
}

export type Executable = {
  source: string
  config: ExecutableConfig 
}

export class CreateGameDto {
  gameruleId: Executable
  players: Executable[]
  configs: {
    [key: string]: any
  }
}

