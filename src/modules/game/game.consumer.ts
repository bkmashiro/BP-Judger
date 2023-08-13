import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BotPreparedType, BotType, CreateGameDto_test, HumanType } from './dto/create-game.dto';
import { GameManager } from 'src/game/game';
import { GameRuleProxy } from 'src/game/gamerules/gameruleProxy/GameRuleProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerFacade as PlayerFacade } from '../player/entities/player.entity';
import { Inject } from '@nestjs/common';
import { Bot } from '../bot/entities/bot.entity';
import { Repository } from 'typeorm';
import { GameruleInstance } from '../gamerule/entities/gamerule.entity';
import { NsJailConfig } from 'src/jail/NsjailRush';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerProxyManager } from 'src/game/players/playerProxy/playerProxy';

@Processor('game')
export class GameConsumer {

  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    @InjectRepository(GameruleInstance)
    private readonly gameruleRepository: Repository<GameruleInstance>,
  ) { }

  @Process('game')
  async consume(_job: Job<unknown>) {
    const job = _job as Job<CreateGameDto_test>
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
    //preparing

    // prepare gamerule proxy
    const gameRuleId = data.gameruleId //TODO: need to use this id to get gamerule
    const gamerulePipeline = new BKPileline({
      jobs: [
        {
          name: 'run_test_gamerule',
          run: '/usr/local/bin/ts-node ${@src}/game/gamerules/gameruleProxy/gamerule.test.ts',
        }
      ]
    }).setTimeout(1000);
    gamerulePipeline.run() // Not to wait for the result

    // prepare player proxies
    const bot_players = players.filter(player => player.type === 'bot') as BotType[]
    const human_players = players.filter(player => player.type === 'human') as HumanType[]
    // console.log(bot_players)
    for (const bot_player of bot_players) {
      const botPlayerConfig = await this.botRepository.findOne({ where: { id: bot_player.botId } }) // TODO: need to use this config to get bot
      const { memory_limit } = await this.gameruleRepository.findOne({ where: { id: gameRuleId } }) // TODO: need to use this config to get bot
      const playerInst = await PlayerFacade.ProxyPlayer(botPlayerConfig.name, botPlayerConfig.tags, botPlayerConfig.code)
      // register players to game
      // TODO: clean this
      gameInstance.registerGamer(playerInst.proxy)
      prepareBotPlayer(playerInst)
    }


    console.log(`Job ${_job.id} is running`)
    return 'done';
  }
}

async function prepareBotPlayer(bot_player_inst: PlayerFacade) {
  const { execPath } = await bot_player_inst.prepare() as BotPreparedType
  console.log(`Player ${bot_player_inst.id} prepared at ${execPath}`)
  const exec_pipeline = new BKPileline({
    jobs: [
      {
        name: 'run_test_bot',
        run: execPath,

        jail: {
          mount: [
            "/tmp/code",
            execPath
          ],
          mount_readonly: [
            "/bin",
            "/sbin",
            "/lib",
            "/lib64/",
            "/usr/",
            "/sbin/",
            "/dev",
            "/dev/urandom",
            "/run/netns"
          ],
          timeout: 10,
          mem_max: 256,
          user: 1919,
          group: 1919,
          pid_max: 32,
          safetySetup: true,
          env: {
            "PATH": "/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/local/sbin"
          },
          // really_quiet: true
        } as NsJailConfig,
        netns: 'jail'
      }
    ]
  })
  exec_pipeline.run()
}