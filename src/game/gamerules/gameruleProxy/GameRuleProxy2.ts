import { ServerDuplexStream } from "@grpc/grpc-js";
import { JSONMessage, UnimplementedGameRuleProxyServiceService } from "./grpc/ts/jsonmsg";
import { GameRuleBase } from "../IGame";
import { MatchContext } from "src/game/game";
import { GameID, PlayerMoveWarpper } from "src/pipelining/modules/playerModule/player";
import { RG } from "./RG";
import { GameRuleFactory } from "./gameruleProxy";





export class GameRuleProxyV2 extends GameRuleBase {
  gameId: GameID // A game is always bind to a gamerule
  rgs : Record<string, RG> = {
    "validate_game_pre_reqirements": null,
    "validate_move_post_reqirements": null,
    "validate_move": null,
    "accept_move": null,
    "init_game": null,
  }
  constructor(gameId: GameID) {
    super()
    this.gameId = gameId
  }

  validate_game_pre_reqirements(ctx: MatchContext): boolean {
    const rg = this.rgs["validate_game_pre_reqirements"]
    throw new Error("Method not implemented.");
  }
  validate_move_post_reqirements(ctx: MatchContext, move: PlayerMoveWarpper): boolean {
    const rg = this.rgs["validate_move_post_reqirements"]
    throw new Error("Method not implemented.");
  }
  validate_move(ctx: MatchContext, move: PlayerMoveWarpper): boolean {
    const rg = this.rgs["validate_move"]
    throw new Error("Method not implemented.");
  }
  accept_move(ctx: MatchContext, move: PlayerMoveWarpper): void {
    const rg = this.rgs["accept_move"]
    throw new Error("Method not implemented.");
  }
  
  async init_game(ctx: MatchContext): Promise<void> {
    const rg = this.rgs["init_game"]
    const q_ctx = JSON.parse(await rg.doQuery()["ctx"])
    Object.assign(ctx, q_ctx)
  }

  register_rg(rg: RG){
    const funcName = rg.funcName
    if(!(funcName in this.rgs)) throw new Error(`[GameRuleProxyV2.register_rg] rg ${funcName} not found`)
    if (this.rgs[funcName] === null) {
      this.rgs[funcName] = rg
    } else {
      throw new Error(`[GameRuleProxyV2.register_rg] rg ${funcName} already registered`)
    }
  }

  
  public get isReady() : boolean {
    // only if all rgs are registered
    return Object.values(this.rgs).every(rg => rg !== null)
  }
  
}

export class GameRuleProxyManager extends GameRuleFactory {
  static active_proxies: Map<GameID, GameRuleBase> = new Map()

  newGameRuleProxy(uuid: string): GameRuleBase {
    const proxy = new GameRuleProxyV2(uuid)
    GameRuleProxyManager.active_proxies.set(uuid, proxy)
    return proxy
  }

  static getGameRuleProxy(uuid: GameID): GameRuleProxyV2 | undefined {
    return GameRuleProxyManager.active_proxies.get(uuid) as GameRuleProxyV2
  }

  static removeGameRuleProxy(uuid: GameID) {
    console.log(`GameRule ${uuid} removed`)
    GameRuleProxyManager.active_proxies.delete(uuid)
  }
}



export class GameRuleGRPCService extends UnimplementedGameRuleProxyServiceService {
  ValidateGamePreRequirements(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
  }

  ValidateMovePostRequirements(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {

  }

  ValidateMove(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {

  }

  AcceptMove(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {

  }

  InitGame(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "InitGame", call, null)
  }
}
