import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerInstance } from './entities/player.entity';


@Module({
  imports:[
    TypeOrmModule.forFeature([PlayerInstance])
  ],
  controllers: [PlayerController],
  providers: [PlayerService]
})
export class PlayerModule {}
