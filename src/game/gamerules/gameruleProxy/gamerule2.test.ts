import * as grpc from "@grpc/grpc-js";
import { GameRuleProxyServiceClient } from "./grpc/ts/jsonmsg";
import { RG } from "./RG";


const GameRuleProxy = new GameRuleProxyServiceClient("0.0.0.0:30010", grpc.credentials.createInsecure());

GameRuleProxy.waitForReady(Infinity, (err) => {
  if (!err) {
    console.log("Service Ready")
  } else {
    console.log("Service Not Ready with error", err)
    return
  }
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function compare_number(a: number, b: number){
  if(a > b) return '>'
  if(a < b) return '<'
  return '='
}

let gameId = `ac856d20-4e9c-409f-b1b3-d2d41a1df9a0`
const secret = {}
const InitGameStream = GameRuleProxy.InitGame()
const rg1 = new RG(gameId, "InitGame", InitGameStream, (msg) => {
  secret["target"] = 114514
  return {
    ctx: {
      moves: [],
    }
  }
})
const ValidateGamePreRequirementsStream = GameRuleProxy.ValidateGamePreRequirements()
const rg2 = new RG(gameId, "ValidateGamePreRequirements", ValidateGamePreRequirementsStream, (msg) => {
  const ctx = msg["ctx"]
  const players = ctx["players"]
  if (Object.entries(players).length === 1) {
    return true
  }
  return false
})
const ValidateMovePostRequirementsStream = GameRuleProxy.ValidateMovePostRequirements()
const rg3 = new RG(gameId, "ValidateMovePostRequirements", ValidateMovePostRequirementsStream, (msg) => {
  const ctx = msg["ctx"]
  const moveWarpped = msg["move"]
  const move = moveWarpped['move']
  let winner = null
  let shallContinue = true

  if(move['guess'] === secret['target']) { // game shall over
    console.warn(`[AcceptMove] ${moveWarpped['by']} win!`)
    winner = moveWarpped['by']
    shallContinue = false
  }
  return {
    ctx,
    shallContinue,
    winner,
  }
})
const ValidateMoveStream = GameRuleProxy.ValidateMove()
const rg4 = new RG(gameId, "ValidateMove", ValidateMoveStream, (msg) => {
  const ctx = msg["ctx"]
  const move = msg["move"]["move"]
  const by = msg["move"]["by"]

  // console.log(`[ValidateMove] move`,move)
  if (move.hasOwnProperty('guess')) {
    console.log(`[ValidateMove] ${by} guess ${move['guess']}`)
    if (typeof move['guess'] === 'number') {
      return true
    }
  }
  return false
})
const AcceptMoveStream = GameRuleProxy.AcceptMove()
const rg5 = new RG(gameId, "AcceptMove", AcceptMoveStream, (msg) => {
  const ctx = msg["ctx"]
  const move = msg["move"]["move"]
  ctx['moves'].push({
    move,
    compare_result: compare_number(move['guess'], secret['target'])
  })
  return ctx
})

  ; (async () => {
    try {
      await rg1.Ready()
      await rg2.Ready()
      await rg3.Ready()
      await rg4.Ready()
      await rg5.Ready()
    } catch (e) {
      console.log(e)
    }

  })()