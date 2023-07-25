import { GameRuleBase } from "./GameRuleBase";

export abstract class GameRuleFactory {
  abstract newGameRuleProxy(uuid: string): GameRuleBase
}