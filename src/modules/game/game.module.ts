import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports:[
    BullModule.registerQueue({
      name: 'game',
    })
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
