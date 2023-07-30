import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './modules/game/game.module';
import { BullModule } from '@nestjs/bull';
import { GameruleModule } from './modules/gamerule/gamerule.module';
import { PlayerModule } from './modules/player/player.module';

@Module({
  imports: [GameModule, 
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      prefix: 'bp',
      limiter: {
        max: 8,
        duration: 114514, //TODO: change this
      },
      
    }), GameruleModule, PlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
