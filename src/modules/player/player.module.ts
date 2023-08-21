import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerFacade } from './entities/playerFacade.entity';


@Module({
  imports:[
    TypeOrmModule.forFeature([PlayerFacade])
  ],
  controllers: [PlayerController],
  providers: [PlayerService]
})
export class PlayerModule {}
