import { PlayerID } from "src/game/players/IPlayer"

export type GameRuleResp = {
  playerId: PlayerID,
  data: {
    action: "ready" | "return",
    [key: string]: any
  }
}

export type GameRuleQuery = {
  playerId: PlayerID,
  data: {
    action: "query" | "return",
    [key: string]: any
  }
}