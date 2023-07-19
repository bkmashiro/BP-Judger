import { config } from "./configs/g++";
import { PlayerManager } from "./modules/playerModule/player";
import { POSTModule } from "./modules/testModules";
import { PlayerModule } from "./modules/playerModule/playerModule";
import { BKPileline } from "./jobs/pipelining";
import { TestGame } from "./test-games/testGame";
import { Noob } from "./test-games/player1";
import { GameManager } from "./game/game";
import { PlayerProxy, PlayerProxyManager, shutdownServer } from "./test-games/playerProxy";


; (async () => {
  GameManager.registerGameRule('test', TestGame)
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
    })

  await pipeline.run()

  const ret = await testGame.whenGameOver();
  console.log(`Game ${testGame.uuid} is over, winner is ${ret.winner}`)
  shutdownServer()
})()
