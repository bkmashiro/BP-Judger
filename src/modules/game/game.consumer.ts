import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Game } from './entities/game.entity';
import { BotType, CreateGameDto, HumanType } from './dto/create-game.dto';
import { GameManager } from 'src/game/game';
import { GameRuleProxy } from 'src/game/gamerules/gameruleProxy/GameRuleProxy';
import { PlayerManager } from 'src/game/players/PlayerFactory';
import { PlayerProxy } from 'src/game/players/playerProxy/playerProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { Player } from '../player/entities/player.entity';

@Processor('game')
export class GameConsumer {
  @Process('game')
  async transcode(job: Job<CreateGameDto>) {
    const { data } = job;
    let progress = 0;
    // setup
    // setup game
    const gameInstance = GameManager.newGame('GameRuleProxy')
    // set up gamerule
    const gameRuleInstance = gameInstance.gameRule as GameRuleProxy
    const gameRuleInstanceUUID = gameRuleInstance.gameId
    // set up player proxies
    const players = data.players

    job.progress(++progress);


    //preparing
    
    // prepare gamerule proxy
    const gameRuleId = data.gameruleId //TODO: need to use this id to get gamerule
    const gamerulePipeline = new BKPileline({
      jobs: [
        {
          name: 'run_test_gamerule',
          run: 'ts-node /home/shiyuzhe/lev/bp/bp-judger/src/game/gamerules/gameruleProxy/gamerule.test.ts',
        }
      ]
    })
    gamerulePipeline.run() // Not to wait for the result

    // prepare player proxies
    const bot_players = players.filter(player => player.type === 'bot') as BotType[]
    const human_players = players.filter(player => player.type === 'human') as HumanType[]
    for (const bot_player of bot_players) {
      const botPlayerConfig = (1 as any).config // TODO: need to use this config to get bot
      const player = await Player.newProxyPlayer(botPlayerConfig.name, botPlayerConfig.tags, botPlayerConfig.code)
      await player.prepare()
    }

   



    job.progress(++progress);

    //running
    job.progress(++progress);

    //finished
    job.progress(++progress);

  }
}