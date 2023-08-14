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

export type ExecutableConfig = { // The detail about how to compile/execute the executable is managed by BP-Judger, not the backend
  language: string
  version: string
  [key: string]: any
}

export type Version = {
  major: number
  minor: number
  patch: number
}

export type VersionDescriptor = {
  version: Version
  sign: ">" | ">=" | "=" | "<=" | "<" 
}

export type Executable = {
  source: string
  config: ExecutableConfig 
}

export class CreateGameDto {
  gamerule: CreateGameruleDTO
  players: CreatePlayerDTO[]
  configs: {
    [key: string]: any
  }
}

class CreateGameruleDTO {
  exec: Executable
  version: Version
}

// Named/labeled union type
type CreatePlayerDTO = CreateBotPlayerDTO | CreateHumanPlayerDTO

class CreateBotPlayerDTO {
  type: 'bot'
  exec: Executable
  version: Version
  compat:{
    gamerule: string
    versions: VersionDescriptor[]
  } 
}

class CreateHumanPlayerDTO {
  type: 'human'
  socket: any  // TODO implement this
}