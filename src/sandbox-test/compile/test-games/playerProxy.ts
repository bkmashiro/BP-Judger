import { IPlayer, PlayerBase, PlayerFactory, PlayerID, PlayerManager, PlayerMoveWarpper } from "../modules/playerModule/player"
import * as grpc from '@grpc/grpc-js';
import { JsonMessage, UnimplementedPlayerProxyService } from "./grpc/gamer-proxy"
import { GameContext, MatchContext } from "../game/game";
import { PlayerStatus } from "../modules/playerModule/player";

export class PlayerProxy extends PlayerBase {

  constructor(uuid: string) {
    super(uuid)
  }

  move(ctx: MatchContext): Promise<PlayerMoveWarpper> {
    return new Promise((resolve, reject) => {
      PlayerProxyGRPCService.letPlayerMove(this.uuid, ctx).then((move: PlayerMoveWarpper) => {
        resolve(move)
      }).catch((err: Error) => {
        reject(err)
      })
    })
  }

  onGameover(gameContext: GameContext) {
    super.onGameover(gameContext)
    this.setStatus('offline')
    PlayerProxyManager.removePlayerProxy(this.uuid)
  }
}


// PlayerProxyManager will set up gRPC server and handle the `move` function call from the player
// this will specify which proxy to use 
export class PlayerProxyManager extends PlayerFactory {

  static active_proxies: Map<PlayerID, IPlayer> = new Map()

  newPlayer(): PlayerProxy {
    const proxy_player = new PlayerProxy(PlayerManager.newplayerID())
    PlayerProxyManager.active_proxies.set(proxy_player.uuid, proxy_player)
    return proxy_player
  }

  static getPlayerProxy(uuid: PlayerID): IPlayer {
    return PlayerProxyManager.active_proxies.get(uuid)
  }

  static removePlayerProxy(uuid: PlayerID) {
    console.log(`Player ${uuid} removed`)
    PlayerProxyManager.active_proxies.delete(uuid)
    PlayerProxyGRPCService.removePlayerPeer(uuid)
  }
}


// this is used to call client's move function by using stream
class PlayerProxyGRPCService extends UnimplementedPlayerProxyService {
  static peers : Map<PlayerID, grpc.ServerDuplexStream<JsonMessage, JsonMessage>> = new Map()
  static onData = new Map<PlayerID, (data: JsonMessage) => void>()

  Move(call: grpc.ServerDuplexStream<JsonMessage, JsonMessage>): void { //TODO: this shall not call multiple times
    call.on('data', (data: JsonMessage) => {
      const obj = JSON.parse(data.json)
      const playerId = PlayerProxyGRPCService.updatePeers(obj, call)
    })

    call.on('end', () => {
      console.log(`peer ended`)
    })

    call.on('error', (err: Error) => {
      console.error(err)
      const playerId = PlayerProxyGRPCService.getIdByPeer(call)
      console.log(`Client ${playerId} error: ${err}`)
    })
  }

  static updatePeers(msg:object, call: grpc.ServerDuplexStream<JsonMessage, JsonMessage>) :PlayerID {
    if(msg.hasOwnProperty('by') && (msg.hasOwnProperty('move') || msg.hasOwnProperty('action'))) {
      const playerId = msg['by']
      if(!this.peers.has(playerId)){
        PlayerProxyGRPCService.peers.set(playerId, call)
        call.on('data', (data: JsonMessage) => {
          const obj = JSON.parse(data.json)
          const playerId = PlayerProxyGRPCService.updatePeers(obj, call)
          this.onData.get(playerId)(data)
        })
      }
      if (msg.hasOwnProperty('action')){
        PlayerProxyGRPCService.handleAction(playerId, msg['action'])
      }
      return playerId
    } else {
      throw new Error('Invalid message')
    }
  }

  static endPeer(id) {
    const peer = PlayerProxyGRPCService.peers.get(id)
    if(peer) {
      peer.end()
      PlayerProxyGRPCService.peers.delete(id)
    } else {
      throw new Error(`Peer ${id} not found`)
    }
  }

  static getIdByPeer(peer: grpc.ServerDuplexStream<JsonMessage, JsonMessage>) : PlayerID {
    for(const [id, p] of PlayerProxyGRPCService.peers.entries()) {
      if(p === peer) {
        return id
      }
    }
    throw new Error('Peer not found')
  }

  static letPlayerMove(playerId: PlayerID, ctx: MatchContext) : Promise<PlayerMoveWarpper> {
    const peer = PlayerProxyGRPCService.peers.get(playerId)
    if(peer) {
      peer.write(new JsonMessage({json: JSON.stringify({
        playerId: playerId,
        action: 'move',
        context: ctx
      })}))
      
      return new Promise((resolve, reject) => {
        PlayerProxyGRPCService.onData.set(playerId, (data: JsonMessage) => {
          const obj = JSON.parse(data.json)
          if(obj.hasOwnProperty('move')) {
            resolve(obj)
          } else {
            throw new Error('Invalid message')
          }
        })
      })

    } else {
      throw new Error(`Peer ${playerId} not found`)
    }
  }

  static handleAction(playerId: PlayerID, action: string) {
    const player = PlayerProxyManager.getPlayerProxy(playerId)
    if(player) {
      if (action === 'ready') {
        (player as PlayerBase).setStatus('ready')
      } else if (action === 'move') {
        (player as PlayerBase).setStatus('playing')
      }else{
        throw new Error(`Invalid action ${action}`)
      }
    } else {
      throw new Error(`@Player ${playerId} not found`)
    }
  }

  static removePlayerPeer(uuid: PlayerID) {
    this.endPeer(uuid)
    PlayerProxyGRPCService.peers.delete(uuid)
    PlayerProxyGRPCService.onData.delete(uuid)
  }

  
}

export function shutdownServer() {
  server.tryShutdown(() => {
    console.log(`Server shutdown successfully`)
  })
}
const server = new grpc.Server();
server.addService(UnimplementedPlayerProxyService.definition, new PlayerProxyGRPCService());
server.bindAsync(
    "0.0.0.0:8848",
    grpc.ServerCredentials.createInsecure(),
    () => server.start()
);
