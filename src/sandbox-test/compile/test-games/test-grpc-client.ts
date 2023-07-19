import * as grpc from "@grpc/grpc-js";
import {PlayerProxyClient, JsonMessage} from "./grpc/gamer-proxy";

const gamerProxy = new PlayerProxyClient("0.0.0.0:8848", grpc.credentials.createInsecure());

let l=0, r=1000000, mid=(l+r)/2

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function Move(ctx) : Promise<object> {

  // console.log(`ctx is ${JSON.stringify(ctx)}`)

  const gusses = ctx['moves']
  if(gusses.length === 0) {
    console.log(`I guess ${mid}`)
    return {
      by: playerId,
      move: {
        guess: mid
      }
    }
  }
  const lastGuess = gusses[gusses.length - 1]
  // console.log(`lastGuess is ${JSON.stringify(lastGuess)}`)
  const number = lastGuess['move']['guess']
  const result = lastGuess['compare_result']
  console.log(`${result}`)
  // think for 1000ms
  await delay(20)
  
  if (result === '=') {
    console.log(`I win! The number is ${number}`)
  } else if(result === '<') {
    l = number
  } else {
    r = number
  }
  mid = Math.floor((l + r) / 2)
  console.log(`I guess ${mid}`)
  return {
    by: playerId,
    move: {
      guess: mid
    }
  }
}

const stream = gamerProxy.Move()
let playerId = `d9668c37-6c28-4b46-8c88-6d550da1410d`
; (async () => {
  // establish two way stream to server

  // send data to server
  stream.write(new JsonMessage({json: JSON.stringify(
    {
      by: playerId,
      action: 'ready'
    }
  )}))

  // receive data from server
  stream.on('data', async (data: JsonMessage) => {
    const ctx = JSON.parse(data.json)

    if(!playerId && ctx.hasOwnProperty('playerId')) {
      playerId = ctx['playerId']
    }

    if (ctx.hasOwnProperty('action')) {
      if (ctx['action'] === 'move') {
        const reply = await Move(ctx['context'])
        if(reply) {
          stream.write(new JsonMessage({json: JSON.stringify(reply)}))
        }
      }
      if (ctx['action'] === 'gameover') {
        console.log(`Gameover! ctx is ${JSON.stringify(ctx)}`)
        console.log('close stream')
        stream.end()
      }
    }
  })
  
  stream.on('end', () => {
    console.log('stream end')
  })

})()