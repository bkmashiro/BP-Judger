import * as grpc from "@grpc/grpc-js";
import { GameRuleProxyServiceClient, GameRuleQuery, GameRuleResp, GameId } from "./grpc/ts/gamerule";
import {GameRuleQuery as GameRuleQueryType } from "./grpc/gamerule.io"

const GameRuleProxy = new GameRuleProxyServiceClient("0.0.0.0:8849", grpc.credentials.createInsecure());
console.log("Proxy up")

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let gameId = `ac856d20-4e9c-409f-b1b3-d2d41a1df9a0`

function w(o) {
  return {
    gameId: { value: gameId },
    data: { value: JSON.stringify(o) }
  }
}

GameRuleProxy.waitForReady(Infinity, (err) => {
  if(!err) {
    console.log("Service Ready")
  }else{
    console.log("Service Not Ready with error", err)
    return
  }
})

enum funcs {
  ValidateGamePreRequirements = "ValidateGamePreRequirements",
  ValidateMovePostRequirements = "ValidateMovePostRequirements",
  ValidateMove = "ValidateMove",
  AcceptMove = "AcceptMove",
  InitGame = "InitGame",
}

const streams = {
  [funcs.ValidateGamePreRequirements]: GameRuleProxy.ValidateGamePreRequirements(),
  [funcs.ValidateMovePostRequirements]: GameRuleProxy.ValidateMovePostRequirements(),
  [funcs.ValidateMove]: GameRuleProxy.ValidateMove(),
  [funcs.AcceptMove]: GameRuleProxy.AcceptMove(),
}
const initial_stream = GameRuleProxy.InitGame()

const extract = (data: GameRuleQuery) => {return JSON.parse(data.toObject().data.value) as GameRuleQueryType["data"] }

const writeWarpped = (stream, data) => {
  stream.write(GameRuleResp.fromObject(w(data)))
}

const sayHello = (stream) => {
  console.log("sayHello")
  stream.write(GameRuleResp.fromObject(w({ action: "ready" })))
}

let hasInit = false
const initFuncs = () => {
  streams[funcs.ValidateGamePreRequirements].on('data', (data: GameRuleQuery) => {
    console.log("ValidateGamePreRequirements, query is", data.toObject())
    const dat = extract(data)

    const ctx = dat["ctx"]
  })
  streams[funcs.ValidateMovePostRequirements].on('data', (data: GameRuleQuery) => {
    console.log("ValidateMovePostRequirements, query is", data.toObject())
    const dat = extract(data)

    const ctx = dat["ctx"]
    const move = dat["move"]
  })
  streams[funcs.ValidateMove].on('data', (data: GameRuleQuery) => {
    console.log("ValidateMove, query is", data.toObject())
    const dat = extract(data)

    const ctx = dat["ctx"]
    const move = dat["move"]
  })
  streams[funcs.AcceptMove].on('data', (data: GameRuleQuery) => {
    console.log("AcceptMove, query is", data.toObject())
    const dat = extract(data)

    const ctx = dat["ctx"]
    const move = dat["move"]
  })

  Object.entries(streams).forEach(([k, v]) => {
    sayHello(v)
  })
}

initial_stream.on('data', (data: GameRuleQuery) => {
  const dat = extract(data)
  console.log("InitGame, query data is", dat)
  if(!hasInit){
    initFuncs()
    hasInit = true
  }
  if(dat.action === "query") {
    writeWarpped(initial_stream, { 
      action: "return", 
      data: { 
        ctx: { 
          moves:[],
        },
        secret: {
          target: 114514
        }
      } 
    })
  }
})

sayHello(initial_stream)






  ; (async () => {


  })()