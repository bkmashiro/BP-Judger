import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './modules/game/game.module';
import { BullModule } from '@nestjs/bull';
import { GameruleModule } from './modules/gamerule/gamerule.module';
import { PlayerModule } from './modules/player/player.module';
import { BotModule } from './modules/bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
          database: config.get('DB_DATABASE'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          synchronize: config.get('DB_SYNC'),
          entities: [
            __dirname + '/**/*.entity{.ts,.js}'
          ], 
          timezone: '+08:00',
        };
      },
    }),
    
    GameruleModule, PlayerModule, BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
