import { ServerDuplexStream } from "@grpc/grpc-js";
import { JSONMessage, UnimplementedGameRuleProxyServiceService } from "./rg-grpc/ts/jsonmsg";
import { MatchContext } from "../../../game/game";
import { RG } from "./RG";
import * as grpc from '@grpc/grpc-js';
import { config } from "../../../configs/config";
import { GameRuleFactory } from "../GameRuleFactory";
import { GameRuleBase } from "../GameRuleBase";
import { GameID, PlayerMoveWarpper } from "../../../game/players/IPlayer";

export class GameRuleProxy extends GameRuleBase {
  gameId: GameID // A game is always bind to a gamerule

  rgs: Record<string, RG> = {
    "ValidateGamePreRequirements": null,
    "ValidateMovePostRequirements": null,
    "ValidateMove": null,
    "AcceptMove": null,
    "InitGame": null,
  }

  constructor(gameId: GameID) {
    super()
    this.gameId = gameId
    this.on("rg-registered", () => {
      const _ = this.isReady()
    })
  }

  async init_game(ctx: MatchContext): Promise<void> {
    const rg = this.rgs["InitGame"]
    const ret = (await rg.doQuery({ ctx }))
    const ret_ctx = ret["ctx"]
    Object.assign(ctx, ret_ctx)
  }

  msgQueue: MatchContext[] = []
  async validate_game_pre_requirements(ctx: MatchContext): Promise<boolean> {
    console.log(`[validate_game_pre_requirements] called, ctx is ${JSON.stringify(ctx)}`)
    await this.whenReady
    const rg = this.rgs["ValidateGamePreRequirements"]
    const ret = await rg.doQuery({ ctx }) as boolean
    console.log(`[GameRuleProxyV2.validate_game_pre_requirements] ret is ${ret}`)
    return ret
  }

  async validate_move_post_requirements(ctx: MatchContext, move: PlayerMoveWarpper): Promise<boolean> {
    const rg = this.rgs["ValidateMovePostRequirements"]
    const ret = await rg.doQuery({ ctx, move })
    if (!ret["shallContinue"]) {
      Object.assign(ctx, ret["ctx"])
      if (ret["winner"]) {
        this.winnerIs(ret["winner"])
      }
      this.gameover()
    }
    return ret["shallContinue"]
  }

  async validate_move(ctx: MatchContext, move: PlayerMoveWarpper): Promise<boolean> {
    const rg = this.rgs["ValidateMove"]
    const ret = await rg.doQuery({ ctx, move }) as boolean
    return ret
  }

  async accept_move(ctx: MatchContext, move: PlayerMoveWarpper): Promise<void> {
    const rg = this.rgs["AcceptMove"]
    const ret = await rg.doQuery({ ctx, move })
    Object.assign(ctx, ret)
  }

  register_rg(rg: RG) {
    // console.log(`[GameRuleProxyV2.register_rg] registering rg ${rg.funcName}`)
    const funcName = rg.funcName
    if (!(funcName in this.rgs)) throw new Error(`[GameRuleProxyV2.register_rg] rg ${funcName} not found`)
    if (this.rgs[funcName] === null) {
      this.rgs[funcName] = rg
    } else {
      throw new Error(`[GameRuleProxyV2.register_rg] rg ${funcName} already registered`)
    }
    this.emit("rg-registered", rg)
  }

  whenReady = new Promise((resolve, reject) => {
    this.once("ready", resolve)
  })



  public async isReady(): Promise<boolean> {
    // only if all rgs are registered
    if (Object.values(this.rgs).every(rg => rg !== null)) {
      if (this.status !== "ready") {
        this.status = "ready"
        this.emit("ready")
        console.log(`GameRuleProxy ${this.gameId} is ready`)
      }
      return true
    }
    return false
  }

  override gameover(): this {
    super.gameover()
    this.close()
    GameRuleProxyManager.removeGameRuleProxy(this.gameId)
    return this
  }

  public close() {
    for (const rg of Object.values(this.rgs)) {
      rg.close()
    }
  }
}

export class GameRuleProxyManager extends GameRuleFactory {

  private static _instance: GameRuleProxyManager

  static get instance(): GameRuleProxyManager {
    if (!this._instance) {
      this._instance = new GameRuleProxyManager()
    }
    return this._instance
  }

  static active_proxies: Map<GameID, GameRuleBase> = new Map()
  private constructor() {
    super()
    GameRuleProxyManager.startServer()
  }
  newGameRuleProxy(uuid: string): GameRuleBase {
    const proxy = new GameRuleProxy(uuid)
    GameRuleProxyManager.active_proxies.set(uuid, proxy)
    return proxy
  }

  static getGameRuleProxy(uuid: GameID): GameRuleProxy | undefined {
    return GameRuleProxyManager.active_proxies.get(uuid) as GameRuleProxy
  }

  static removeGameRuleProxy(uuid: GameID) {
    console.log(`GameRule ${uuid} removed`)
    GameRuleProxyManager.active_proxies.delete(uuid)
  }

  static server = new grpc.Server();
  static startServer() {
    this.server.addService(UnimplementedGameRuleProxyServiceService.definition, new GameRuleGRPCService());
    this.server.bindAsync(
      config.gameRuleProxyUrl,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.log("Error in binding port", err)
          return
        }
        this.server.start()
      }
    );
    console.log("GameRuleProxyService is running on", config.gameRuleProxyUrl)
  }

  static shutdownServer() {
    this.server.tryShutdown((err) => {
      if (err) {
        console.log("Error in shutting down server", err)
        return
      }
      console.log("Server shut down")
    })
  }

  static forceShutdownServer() {
    this.server.forceShutdown()
  }
}

export class GameRuleGRPCService extends UnimplementedGameRuleProxyServiceService {
  ValidateGamePreRequirements(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "ValidateGamePreRequirements", call, null)
  }

  ValidateMovePostRequirements(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "ValidateMovePostRequirements", call, null)
  }

  ValidateMove(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "ValidateMove", call, null)
  }

  AcceptMove(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "AcceptMove", call, null)
  }

  InitGame(call: ServerDuplexStream<JSONMessage, JSONMessage>): void {
    new RG(null, "InitGame", call, null)
  }
}





