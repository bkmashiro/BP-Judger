import { config } from "../configs/g++2";
import { POSTModule } from "../pipelining/modules/testModules/POSTModule";
import { BKPileline } from "../pipelining/pipelining";
import { GuessNumberGame } from "./gamerules/local/GuessNumber/GuessNumberGame";
import { Noob as NoobPlayer } from "./gamerules/local/GuessNumber/bots/ts/Noob";
import { GameManager, GameRuleManager } from "./game";
import { PlayerProxyManager as PlayerProxyFactory } from "./players/playerProxy/playerProxy";
import { PlayerModule } from "../pipelining/modules/playerModule/playerModule";
import { PlayerManager } from "./players/PlayerFactory";
import { GameRuleProxyManager } from "./gamerules/GameRuleProxyManager";


; (async () => {
  GameRuleManager.registerGameRule('GuessNumber', GuessNumberGame) // Local TS gamerule
  GameRuleManager.registerGameRule('GameRuleProxy', GameRuleProxyManager.instance) // Remote gRPC gamerule
  
  PlayerManager.registerGamerType('noob', NoobPlayer)                 // register prototype class
  PlayerManager.registerGamerType('proxy', PlayerProxyFactory.instance)  // register factory 

  const guessNumberGame = GameManager.newGame('GuessNumber')
  // const guessNumberGame = GameManager.newGame('GameRuleProxy')

  console.log(`Game ${guessNumberGame.uuid} created`)
  
  BKPileline.registerModule('post', new POSTModule())
  BKPileline.registerModule('player', new PlayerModule())

  const pipeline = new BKPileline(config)
  pipeline.ctx(
    {
      'out_file_name': 'helloworld.out',
      'in_file_name': 'helloworld.cpp',
      'gameId': guessNumberGame.uuid,
      'post_url': '3a3f3685-dd7c-48da-8c82-1466b03d24d8'
    }
  )

  await pipeline.run()  // this runs configed modules in pipeline
                        // you can do compile, setup rooms, etc. here

  const ret = await guessNumberGame.whenGameOver();
  console.log(`Game ${guessNumberGame.uuid} is over, winner is `, ret.winner)
  PlayerProxyFactory.shutdownServer()// fix this!!!
  GameRuleProxyManager.shutdownServer() 
})()
