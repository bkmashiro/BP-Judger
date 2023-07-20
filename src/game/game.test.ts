import { config } from "../configs/g++";
import { POSTModule } from "../pipelining/modules/testModules";
import { BKPileline } from "../pipelining/pipelining";
import { GuessNumberGame } from "./gamerules/GuessNumber/GuessNumberGame";
import { Noob } from "./gamerules/GuessNumber/bots/Noob";
import { GameManager } from "./game";
import { PlayerProxy, PlayerProxyManager, shutdownServer } from "./players/playerProxy";
import { PlayerModule } from "../pipelining/modules/playerModule/playerModule";
import { PlayerManager } from "../pipelining/modules/playerModule/player";


; (async () => {
  GameManager.registerGameRule('test', GuessNumberGame)
  PlayerManager.registerGamerType('noob', Noob) // register class (class-prototype)
  PlayerManager.registerGamerType('proxy', new PlayerProxyManager()) // register factory 

  const testGame = GameManager.newGame('test')

  BKPileline.registerModule('post', new POSTModule())
  BKPileline.registerModule('player', new PlayerModule())

  const pipeline = new BKPileline(config)
  pipeline.addCtx(
    {
      'out_file_name': 'helloworld.out',
      'in_file_name': 'helloworld.cpp',
      'gameId': testGame.uuid,
    }
  )

  await pipeline.run()

  const ret = await testGame.whenGameOver();
  console.log(`Game ${testGame.uuid} is over, winner is ${ret.winner}`)
  shutdownServer()
})()
