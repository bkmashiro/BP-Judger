import { MatchContext } from "../game"
import { PlayerBase } from "./PlayerBase"

export interface IPlayer {
  uuid: string
  move(context: MatchContext): Promise<PlayerMoveWarpper>
  playerStatus: PlayerStatus 
}

export type IPlayerConstructor = (new (uuid: string) => PlayerBase);

export type PlayerMoveWarpper = {
  'by': PlayerID,
  'move': PlayerMove,
}

export type PlayerMove = any

export type GameID = string
export type PlayerID = string
export type GameName = string
export type PlayerStatus = 'online' | 'offline' | 'playing' | 'waiting' | 'ready'