import { Processor, Process, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { BotPreparedType, BotType, CreateGameDto, CreateGameDto_test, HumanType } from './dto/create-game.dto';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerFacade as PlayerFacade } from '../player/entities/playerFacade.entity';
import { BotConfig } from '../bot/entities/bot.entity';
import { Repository } from 'typeorm';
import { GameruleFacade } from '../gamerule/entities/gameruleFacade.entity';
import { NsJailConfig } from 'src/jail/NsjailRush';
import { InjectRepository } from '@nestjs/typeorm';
import { GameFacade } from './entities/gameFacade.entity';
import { Logger } from '@nestjs/common';

@Processor('game')
export class GameConsumer {

  constructor(
    @InjectRepository(BotConfig)
    private readonly botRepository: Repository<BotConfig>,
    @InjectRepository(GameruleFacade)
    private readonly gameruleRepository: Repository<GameruleFacade>,
  ) { }

  @Process('game-test')
  async game_test(_job: Job<unknown>) {
    const { data } = _job as Job<CreateGameDto_test>

    const game = new GameFacade('GameRuleProxy')
    const gameRuleId = data.gameruleId            //TODO: need to use this id to get gamerule
    const gamerulePipeline = BKPileline.fromJobs(
      {
        name: 'run_test_gamerule',
        run: '/usr/local/bin/ts-node ${@src}/game/gamerules/gameruleProxy/gamerule.test.ts',
      }
    ).setTimeout(20000);
    gamerulePipeline.run() // Not to wait for the result

    // prepare player proxies
    const bot_players =  data.players.filter(player => player.type === 'bot') as BotType[]
    const human_players =  data.players.filter(player => player.type === 'human') as HumanType[]

    for (const bot_player of bot_players) {
      const botPlayerConfig = await this.botRepository.findOneOrFail({ where: { id: bot_player.botId } }) // TODO: need to use this config to get bot
      const gamerule = await this.gameruleRepository.findOneOrFail({ where: { id: gameRuleId } })         // TODO: need to use this config to get bot
      const { memory_limit } = gamerule


      const player = PlayerFacade.new('proxied', botPlayerConfig)
      game.registerPlayer(player)

      prepareBotPlayer(player)
    }

    return 'done';
  }

  @Process('game')
  async game(_job: Job<unknown>) {
    const { data } = _job as Job<CreateGameDto>
    const game = new GameFacade('GameRuleProxy')
    



  }

  @OnQueueFailed()
  onError(job, error: Error) {
    Logger.error(`in job ${job.id}` ,error)
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
        netns: 'jail',
        // verbose: true,
      }
    ]
  })
  exec_pipeline.run()
}