import { MatchContext } from "../game"
import { PlayerBase } from "./PlayerBase"

export interface IPlayer {
  uuid: string
  move(context: MatchContext): Promise<PlayerMoveWarpper>
  status: PlayerStatus
}

export type IPlayerConstructor = (new (uuid: string) => PlayerBase);

export type PlayerMoveWarpper = {
  'by': PlayerID,
  'move': PlayerMove,
}

export type PlayerMove = any

export type GameID = string
export type PlayerID = string
export type CustomStringName = `better_not_use_this_${string}`
export type GameRuleName = "GameRuleProxy" | "human" | CustomStringName | 'GuessNumber'
export type PlayerStatus = 'online' | 'offline' | 'playing' | 'waiting' | 'ready' | 'error' | 'unknown' | 'unset'