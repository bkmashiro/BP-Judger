import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { BullModule } from '@nestjs/bull';
import { Game } from './entities/game.entity';
import { GameConsumer } from './game.consumer';
import { BotModule } from '../bot/bot.module';
import { GameruleModule } from '../gamerule/gamerule.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from '../bot/entities/bot.entity';
import { GameruleInstance } from '../gamerule/entities/gamerule.entity';

@Module({
  imports:[
    BullModule.registerQueue({
      name: 'game',
    }),
    TypeOrmModule.forFeature([Bot, GameruleInstance]),
  ],
  controllers: [GameController],
  providers: [GameService, GameConsumer],
})
export class GameModule {}