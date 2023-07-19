import { config } from "./configs/g++";
import { PlayerManager } from "./modules/playerModule/player";
import { POSTModule } from "./modules/testModules";
import { GamerModule } from "./modules/playerModule/playerModule";
import { BKPileline } from "./jobs/pipelining";
import { TestGame } from "./test-games/testGame";
import { Noob } from "./test-games/gamer1";
import { GameManager } from "./game/game";


; (async () => {
  GameManager.registerGameRule('test', TestGame)
  PlayerManager.registerGamerType('noob', Noob)
  const testGame = GameManager.newGame('test')

  BKPileline.registerModule('post', new POSTModule())
  BKPileline.registerModule('gamer', new GamerModule())

  const pipeline = new BKPileline(config)
  pipeline.addCtx(
    {
      'out_file_name': 'helloworld.out',
      'in_file_name': 'helloworld.cpp',
      'gameId': testGame.uuid,
    })

  await pipeline.run()

  const ret = await testGame.whenGameOver;
  console.log(`Game ${testGame.uuid} is over, winner is ${ret.winner}`)
})()