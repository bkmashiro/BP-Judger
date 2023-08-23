import { ServerDuplexStream } from "@grpc/grpc-js";
import { MatchContext } from "../../game/game";
import { RG } from "./gameruleProxy/RG";
import * as grpc from '@grpc/grpc-js';
import { config } from "../../configs/config";
import { GameRuleFactory } from "./GameRuleFactory";
import { GameID, PlayerMoveWarpper } from "../../game/players/IPlayer";
import { Logger } from "@nestjs/common";
import { GameRuleBase } from "./GameRuleBase";
import { GameRuleGRPCService, GameRuleProxy } from "./gameruleProxy/GameRuleProxy";
import { UnimplementedGameRuleProxyServiceService } from "./gameruleProxy/rg-grpc/ts/jsonmsg";

export class GameRuleProxyManager extends GameRuleFactory {
  private static logger = new Logger("GameRuleProxyManager")
  private static _instance: GameRuleProxyManager

  static get instance(): GameRuleProxyManager {
    if (!this._instance) {
      this._instance = new GameRuleProxyManager()
    }
    return this._instance
  }

  static active_proxies: Map<GameID, GameRuleBase> = new Map()

  static set(proxy: GameRuleBase) {
    GameRuleProxyManager.active_proxies.set(proxy._parent.uuid, proxy)
  }

  private constructor() {
    super()
    GameRuleProxyManager.startServer()
  }

  newGameRule(): GameRuleBase {
    const proxy = new GameRuleProxy()
    return proxy
  }

  static get(uuid: GameID): GameRuleProxy | undefined {
    return GameRuleProxyManager.active_proxies.get(uuid) as GameRuleProxy
  }

  static remove(uuid: GameID) {
    GameRuleProxyManager.logger.log(`GameRule ${uuid} removed`)
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
    GameRuleProxyManager.logger.log("GameRuleProxyService is running on", config.gameRuleProxyUrl)
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
