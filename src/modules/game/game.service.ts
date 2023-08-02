import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GameManager } from 'src/game/game';
import { GameRuleProxyManager } from 'src/game/gamerules/gameruleProxy/GameRuleProxy';
import { PlayerManager } from 'src/game/players/PlayerFactory';
import { PlayerProxyManager } from 'src/game/players/playerProxy/playerProxy';
import { BKPileline } from 'src/pipelining/pipelining';
import { PlayerModule } from 'src/pipelining/modules/playerModule/playerModule';

@Injectable()
export class GameService {

  constructor(
    @InjectQueue('game') private readonly gameQueue: Queue,
  ) {
    GameManager.registerGameRule('GameRuleProxy', GameRuleProxyManager.instance) // Remote gRPC gamerule
    PlayerManager.registerGamerType('proxy', PlayerProxyManager.instance)  // register factory 
    BKPileline.registerModule('player', new PlayerModule())
  }

  async create(createGameDto: CreateGameDto) {
    const job = await this.gameQueue.add('game', createGameDto);
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
