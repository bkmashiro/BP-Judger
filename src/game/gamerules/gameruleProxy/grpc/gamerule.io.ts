import { PlayerID } from "../../../../pipelining/modules/playerModule/player";

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