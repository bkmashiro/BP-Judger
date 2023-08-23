import { ServerDuplexStream } from "@grpc/grpc-js";
import { JSONMessage, UnimplementedGameRuleProxyServiceService } from "./rg-grpc/ts/jsonmsg";
import { Game, MatchContext } from "../../../game/game";
import { RG } from "./RG";
import * as grpc from '@grpc/grpc-js';
import { config } from "../../../configs/config";
import { GameRuleFactory } from "../GameRuleFactory";
import { GameID, PlayerMoveWarpper } from "../../../game/players/IPlayer";
import { Logger } from "@nestjs/common";
import { GameRuleBase } from "../GameRuleBase";
import { GameRuleProxyManager } from "../GameRuleProxyManager";

export class GameRuleProxy extends GameRuleBase {
  public get gameId() : string | null {
    return this._parent.uuid
  }
   // A game is always bind to a gamerule

  rgs: Record<string, RG> = {
    "ValidateGamePreRequirements": null,
    "ValidateMovePostRequirements": null,
    "ValidateMove": null,
    "AcceptMove": null,
    "InitGame": null,
  }

  constructor() {
    super()
    this.on("rg-registered", async () => {
      const _ = await this.isReady() // just to update status
    })
  }

  async init_game(ctx: MatchContext): Promise<void> {
    const rg = this.rgs["InitGame"]
    const ret = (await rg.doQuery({ ctx }))
    const ret_ctx = ret["ctx"]
    Object.assign(ctx, ret_ctx)
  }

  async validate_game_pre_requirements(ctx: MatchContext): Promise<boolean> {
    // console.log(`[validate_game_pre_requirements] called, ctx is ${JSON.stringify(ctx)}`)
    await this.whenReady
    const rg = this.rgs["ValidateGamePreRequirements"]
    const ret = await rg.doQuery({ ctx }) as boolean
    // console.log(`[GameRuleProxyV2.validate_game_pre_requirements] ret is ${ret}`)
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
    const values = Object.values(this.rgs)
    const res = values.every(rg => rg !== null)
    if (res) {
      if (this.status !== "ready") {
        this.status = "ready"
        this.emit("ready")
        console.log(`GameRuleProxy ${this.gameId} is ready`)
      }
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  }

  override gameover(): this {
    super.gameover()
    this.close()
    GameRuleProxyManager.remove(this.gameId)
    return this
  }

  public close() {
    for (const rg of Object.values(this.rgs)) {
      rg.close()
    }
  }

  override bind_parent(game: Game): void {
    super.bind_parent(game)
    GameRuleProxyManager.set(this)
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
