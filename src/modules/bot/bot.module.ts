import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from './entities/bot.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Bot])
  ],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService]
})
export class BotModule {}
