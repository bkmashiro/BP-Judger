import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BotPreparedType, BotType, CreateGameDto, HumanType } from './dto/create-game.dto';
import { GameManager } from 'src/game/game';
import { GameRuleProxy } from 'src/game/gamerules/gameruleProxy/GameRuleProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerInstance } from '../player/entities/player.entity';
import { Inject } from '@nestjs/common';
import { Bot } from '../bot/entities/bot.entity';
import { Repository } from 'typeorm';
import { GameruleInstance } from '../gamerule/entities/gamerule.entity';
import { NsJailConfig } from 'src/jail/NsjailRush';

@Processor('game')
export class GameConsumer {

  constructor(
    @Inject()
    private readonly botRepository: Repository<Bot>,
    private readonly gameruleRepository: Repository<GameruleInstance>,
  ) {}

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
      const botPlayerConfig = await this.botRepository.findOne({where: {id: bot_player.botId}}) // TODO: need to use this config to get bot
      const { memory_limit } = await this.gameruleRepository.findOne({where: {id: gameRuleId}}) // TODO: need to use this config to get bot
      const player = await PlayerInstance.newProxyPlayer(botPlayerConfig.name, botPlayerConfig.tags, botPlayerConfig.code)
      const { execPath } = await player.prepare() as BotPreparedType
      const exec_pipeline = new BKPileline({
        jobs: [
          {
            name: 'run_test_bot',
            run: execPath,
            jail: {
              mem_max: memory_limit,
            } as NsJailConfig
          }
        ]
      })
      exec_pipeline.run()
    }

    job.progress(++progress);

    //running
    job.progress(++progress);

    //finished
    job.progress(++progress);

  }
}