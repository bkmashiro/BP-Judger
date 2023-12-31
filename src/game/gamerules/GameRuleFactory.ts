import { GameRuleBase } from "./GameRuleBase";

export abstract class GameRuleFactory {
  abstract newGameRule(): GameRuleBase
}