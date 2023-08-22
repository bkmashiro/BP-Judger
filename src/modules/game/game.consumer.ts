import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BotPreparedType, BotType, CreateGameDto_test, HumanType } from './dto/create-game.dto';
import { GameManager } from 'src/game/game';
import { GameRuleProxy } from 'src/game/gamerules/gameruleProxy/GameRuleProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerFacade as PlayerFacade } from '../player/entities/playerFacade.entity';
import { Inject } from '@nestjs/common';
import { BotConfig } from '../bot/entities/bot.entity';
import { Repository } from 'typeorm';
import { GameruleFacade } from '../gamerule/entities/gameruleFacade.entity';
import { NsJailConfig } from 'src/jail/NsjailRush';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerProxyManager } from 'src/game/players/playerProxy/playerProxy';
import { GameFacade } from './entities/gameFacade.entity';

@Processor('game')
export class GameConsumer {

  constructor(
    @InjectRepository(BotConfig)
    private readonly botRepository: Repository<BotConfig>,
    @InjectRepository(GameruleFacade)
    private readonly gameruleRepository: Repository<GameruleFacade>,
  ) { }

  @Process('game')
  async consume(_job: Job<unknown>) {
    const job = _job as Job<CreateGameDto_test>
    const { data } = job;
    
    // setup
    // setup game
    const game = new GameFacade('GameRuleProxy')

    const players = data.players
    //preparing

    // prepare gamerule proxy
    const gameRuleId = data.gameruleId //TODO: need to use this id to get gamerule
    const gamerulePipeline = BKPileline.fromJobs(
        {
          name: 'run_test_gamerule',
          run: '/usr/local/bin/ts-node ${@src}/game/gamerules/gameruleProxy/gamerule.test.ts',
        }
    ).setTimeout(20000);
    gamerulePipeline.run() // Not to wait for the result

    // prepare player proxies
    const bot_players = players.filter(player => player.type === 'bot') as BotType[]
    const human_players = players.filter(player => player.type === 'human') as HumanType[]

    for (const bot_player of bot_players) {
      const botPlayerConfig = await this.botRepository.findOne({ where: { id: bot_player.botId } }) // TODO: need to use this config to get bot
      const gamerule = await this.gameruleRepository.findOneOrFail({ where: { id: gameRuleId } }) // TODO: need to use this config to get bot
      const  { memory_limit } =  gamerule

      const player = PlayerFacade.new('proxied', botPlayerConfig)
      // register players to game
      // TODO: clean this
      game.registerPlayer(player)
      
      prepareBotPlayer(player)
    }

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
        netns: 'jail',
        // verbose: true,
      }
    ]
  })
  exec_pipeline.run()
}