import { GameManager, MatchContext } from "../../game";
import { GameRuleBase } from "../IGame";
import { GameID, PlayerMoveWarpper } from "../../../pipelining/modules/playerModule/player";
import { UnimplementedGameRuleProxyServiceService, GameRuleResp, GameRuleQuery } from "./grpc/ts/gamerule"
import { GameRuleResp as Resp, GameRuleQuery as Query } from "./grpc/gamerule.io"
import { ServerDuplexStream, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { ifNotNullDo } from "../../../utils";
import * as grpc from '@grpc/grpc-js';


export class GameRuleProxy extends GameRuleBase {
  gameId: GameID // A game is always bind to a gamerule

  constructor(gameId: GameID) {
    super()
    this.gameId = gameId
  }

  validate_game_pre_reqirements(ctx: MatchContext): boolean {
    console.log("validate_game_pre_reqirements", ctx)
    GameRuleGRPCService.Write(this.gameId, funcs.ValidateGamePreRequirements, GameRuleResp.fromObject(w(this.gameId, { action: "query", ctx })))
    return false
  }
  validate_move_post_reqirements(ctx: MatchContext, move: PlayerMoveWarpper): boolean {
    console.log("validate_move_post_reqirements", ctx, move)
    return false
  }
  validate_move(ctx: MatchContext, move: PlayerMoveWarpper): boolean {
    console.log("validate_move", ctx, move)
    return false
  }
  accept_move(ctx: MatchContext, move: PlayerMoveWarpper): void {
    console.log("accept_move", ctx, move)
  }

  init_game(ctx: MatchContext): void {
    console.debug("init_game called", ctx)
    console.log("init_game", ctx)

  }

  init_initial() {
    GameRuleGRPCService.addEventListener(this.gameId, onDataEvents.InitGame, this.init_game)
  }

  init() {
    GameRuleGRPCService.addEventListener(this.gameId, onDataEvents.ValidateGamePreRequirements, this.validate_game_pre_reqirements)
    GameRuleGRPCService.addEventListener(this.gameId, onDataEvents.ValidateMovePostRequirements, this.validate_move_post_reqirements)
    GameRuleGRPCService.addEventListener(this.gameId, onDataEvents.ValidateMove, this.validate_move)
    GameRuleGRPCService.addEventListener(this.gameId, onDataEvents.AcceptMove, this.accept_move)
  }
}

enum funcs {
  ValidateGamePreRequirements = "ValidateGamePreRequirements",
  ValidateMovePostRequirements = "ValidateMovePostRequirements",
  ValidateMove = "ValidateMove",
  AcceptMove = "AcceptMove",
  InitGame = "InitGame",
  Peers = "peers",
}

enum onDataEvents {
  ValidateGamePreRequirements = "ValidateGamePreRequirements",
  ValidateMovePostRequirements = "ValidateMovePostRequirements",
  ValidateMove = "ValidateMove",
  AcceptMove = "AcceptMove",
  InitGame = "InitGame",
}

function w(gameId, o) {
  return {
    gameId: { value: gameId },
    data: { value: JSON.stringify(o) }
  }
}

export class GameRuleGRPCService extends UnimplementedGameRuleProxyServiceService {
  InitGame(call: ServerDuplexStream<GameRuleResp, GameRuleQuery>): void {
    console.log("InitGame called")
    call.on('data', (data: GameRuleResp) => {
      const gameId = data.gameId.value
      console.log("InitGame data", data.toObject())
      GameRuleGRPCService.TryInit(gameId)
      GameRuleGRPCService.init(gameId, funcs.InitGame, call)
      // TODO Reformat this
      const proxy = GameRuleProxyManager.getGameRuleProxy(gameId)
      if (proxy) {
        proxy.init()
      } else throw new Error(`[TryInit] GameRule ${gameId} not found`)

      const dat = JSON.parse((data.data.toObject()).value) as Resp["data"];
      if (dat.action === "ready") {
        GameRuleGRPCService.Write(gameId, funcs.InitGame, GameRuleResp.fromObject(w(gameId, { action: "return" })))
      }

      ifNotNullDo(GameRuleGRPCService.onData?.[gameId]?.[funcs.InitGame], dat)
    })
  }

  static TryInit(gameId: GameID) {
    if (!GameRuleGRPCService.connections.has(gameId)) {
      GameRuleGRPCService.connections.set(gameId, {})
      GameRuleGRPCService.onData.set(gameId, {});
      const proxy = GameRuleProxyManager.getGameRuleProxy(gameId)
      if (proxy) {
        proxy.init()
      } else throw new Error(`[TryInit] GameRule ${gameId} not found`)
    }
  }

  ValidateGamePreRequirements(call: ServerDuplexStream<GameRuleResp, GameRuleQuery>): void {
    call.on('data', (data: GameRuleResp) => {
      const gameId = data.gameId.value
      GameRuleGRPCService.init(gameId, funcs.ValidateGamePreRequirements, call)
      GameRuleGRPCService.TryGetProxy(gameId).init_initial()
      ifNotNullDo(GameRuleGRPCService.onData?.[gameId]?.[funcs.ValidateGamePreRequirements], data.data.toObject() as Resp["data"])
    })
  }
  ValidateMovePostRequirements(call: ServerDuplexStream<GameRuleResp, GameRuleQuery>): void {
    call.on('data', (data: GameRuleResp) => {
      const gameId = data.gameId.value
      GameRuleGRPCService.init(gameId, funcs.ValidateMovePostRequirements, call)
      ifNotNullDo(GameRuleGRPCService.onData?.[gameId]?.[funcs.ValidateMovePostRequirements], data.data.toObject() as Resp["data"])
    })
  }
  ValidateMove(call: ServerDuplexStream<GameRuleResp, GameRuleQuery>): void {
    call.on('data', (data: GameRuleResp) => {
      const gameId = data.gameId.value
      GameRuleGRPCService.init(gameId, funcs.ValidateMove, call)
      ifNotNullDo(GameRuleGRPCService.onData?.[gameId]?.[funcs.ValidateMove], data.data.toObject() as Resp["data"])
    })
  }
  AcceptMove(call: ServerDuplexStream<GameRuleResp, GameRuleQuery>): void {
    call.on('data', (data: GameRuleResp) => {
      const gameId = data.gameId.value
      GameRuleGRPCService.init(gameId, funcs.AcceptMove, call)
      const unwarped = data.data.toObject() as Resp["data"]
      const ctx = unwarped["ctx"]
      const move = unwarped["move"]
      ifNotNullDo(GameRuleGRPCService.onData?.[gameId]?.[funcs.AcceptMove], ctx, move)
    })
  }

  static TryGetProxy(uuid: GameID) {
    const proxy = GameRuleProxyManager.getGameRuleProxy(uuid)
    if (!proxy) {
      throw new Error(`GameRule ${uuid} not found`)
    }
    return proxy
  }

  static Write(uuid: GameID, func: string, data: GameRuleResp) {
    const proxy = GameRuleGRPCService.TryGetProxy(uuid)
    const stream = GameRuleGRPCService.connections.get(uuid)?.[func]
    if (!stream) {
      throw new Error(`GameRule ${uuid} ${func} not init`)
    }
    stream.write(data)
  }

  static connections: Map<GameID, {
    ValidateGamePreRequirements?: ServerDuplexStream<GameRuleResp, GameRuleQuery>,
    ValidateMovePostRequirements?: ServerDuplexStream<GameRuleResp, GameRuleQuery>,
    ValidateMove?: ServerDuplexStream<GameRuleResp, GameRuleQuery>,
    AcceptMove?: ServerDuplexStream<GameRuleResp, GameRuleQuery>,
    peer?: string
  }> = new Map()

  static onData = new Map<GameID, {
    ValidateGamePreRequirements?: (data: GameRuleResp) => void,
    ValidateMovePostRequirements?: (data: GameRuleResp) => void,
    ValidateMove?: (data: GameRuleResp) => void,
    AcceptMove?: (data: GameRuleResp) => void
    InitGame?: (data: GameRuleResp) => void
  }>()

  static init(gameId: GameID, func: string, call: ServerDuplexStream<GameRuleResp, GameRuleQuery>) {
    if (GameRuleGRPCService.connections.has(gameId)) {
      if (!GameRuleGRPCService.connections.get(gameId)[func]) {
        GameRuleGRPCService.connections.get(gameId)[func] = call
        console.log(`[in init]GameRule ${gameId} ${func} init`)
      } else {
        throw new Error(`GameRule ${gameId} ${func} already init`)
      }
    } else {
      console.log(`[in init]GameRule ${gameId} not found, creating`)
      throw new Error(`GameRule ${gameId} not found`)
    }
  }

  static remove(gameId: GameID) {
    GameRuleGRPCService.connections.delete(gameId)
    GameRuleGRPCService.onData.delete(gameId)
  }

  static addEventListener(uuid: string, evt: onDataEvents, cb: (...args: any[]) => void) {
    if (!GameRuleGRPCService.onData.has(uuid)) {
      throw new Error(`[addEventListener]GameRule ${uuid} not found`)
    }
    GameRuleGRPCService.onData.get(uuid)[evt] = cb
  }
}

export abstract class GameRuleFactory {
  abstract newGameRuleProxy(uuid: string): GameRuleBase
}

export class GameRuleProxyManager extends GameRuleFactory {
  static active_proxies: Map<GameID, GameRuleBase> = new Map()

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
}


const server = new grpc.Server();
server.addService(UnimplementedGameRuleProxyServiceService.definition, new GameRuleGRPCService());
server.bindAsync(
  "0.0.0.0:8849",
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
);
console.log("GameRuleProxyService is running")



