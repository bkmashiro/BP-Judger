import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { BullModule } from '@nestjs/bull';
import { GameFacade } from './entities/gameFacade.entity';
import { GameConsumer } from './game.consumer';
import { BotModule } from '../bot/bot.module';
import { GameruleModule } from '../gamerule/gamerule.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotConfig } from '../bot/entities/bot.entity';
import { GameruleFacade } from '../gamerule/entities/gameruleFacade.entity';

@Module({
  imports:[
    BullModule.registerQueue({
      name: 'game',
    }),
    TypeOrmModule.forFeature([BotConfig, GameruleFacade]),
  ],
  controllers: [GameController],
  providers: [GameService, GameConsumer],
})
export class GameModule {}
