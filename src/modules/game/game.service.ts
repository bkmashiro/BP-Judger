import { Injectable } from '@nestjs/common';
import { CreateGameDto_test } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GameManager, GameRuleManager } from 'src/game/game';
import { PlayerManager } from 'src/game/players/PlayerFactory';
import { PlayerProxyManager } from 'src/game/players/playerProxy/playerProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerModule } from 'src/pipelining/modules/playerModule/playerModule';
import { CompileModule } from 'src/pipelining/modules/CompileModule/compileModule';
import { FileCahceModule } from 'src/pipelining/modules/FileCacheModule/fileCacheModule';
import { GameRuleProxyManager } from 'src/game/gamerules/GameRuleProxyManager';

@Injectable()
export class GameService {

  constructor(
    @InjectQueue('game') private readonly gameQueue: Queue,
  ) {
    GameRuleManager.registerGameRule('GameRuleProxy', GameRuleProxyManager.instance) // Remote gRPC gamerule
    PlayerManager.registerGamerType('proxy', PlayerProxyManager.instance)  // register factory 
    BKPileline.registerModule('player', new PlayerModule())
    BKPileline.registerModule('compile', new CompileModule())
    BKPileline.registerModule('filecache', new FileCahceModule())
  }

  async create_test(createGameDto: CreateGameDto_test) {
    const job = await this.gameQueue.add('game-test', createGameDto);
    // console.log(job.id)
  }

  findAll() {
    return `This action returns all game`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
