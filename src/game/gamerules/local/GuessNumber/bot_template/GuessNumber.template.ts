import * as grpc from "@grpc/grpc-js";
import { PlayerProxyClient, JsonMessage } from "../../../../../game/players/playerProxy/grpc/typescript/gamer-proxy";

export abstract class GuessNumberGameTemplate {

  private playerId: string
  private server: string
  private proxy: PlayerProxyClient
  private stream: grpc.ClientDuplexStream<JsonMessage, JsonMessage>

  constructor(playerId: string, server: string) {
    this.playerId = playerId
    this.server = server
    this.Init()
  }

  abstract Move(ctx: object): Promise<object>

  private Init() { // this prevents subclass from overriding this method
    // init stream
    this.proxy = new PlayerProxyClient(this.server, grpc.credentials.createInsecure());
    this.stream = this.proxy.Move()

    this.stream.on('data', async (data: JsonMessage) => {
      const ctx = JSON.parse(data.json)

      if (ctx.hasOwnProperty('action')) {
        await this.handleAction(ctx['action'], ctx)
      }
    })

    this.stream.on('end', () => {
      console.log('stream end')
    })
  }

  private warpMove(move: object) {
    return {
      by: this.playerId,
      move: move
    }
  }

  private async handleAction(action: string, ctx: object) {
    if (action === 'gameover') {
      console.log(`Gameover!`)
      this.stream.end()
    } else if (action === 'move') {
      const reply = this.warpMove(await this.Move(ctx['context']))
      this.stream.write(new JsonMessage({ json: JSON.stringify(reply) }))
    } else throw new Error(`Invalid action ${action}`)
  }

  public Ready() {
    this.send(
      {
        by: this.playerId,
        action: 'ready'
      }
    )
  }

  private send(data: object) {
    this.stream.write(new JsonMessage({
      json: JSON.stringify(
        data
      )
    }))
  }
}