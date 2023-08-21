import { Module } from '@nestjs/common';
import { GameruleService } from './gamerule.service';
import { GameruleController } from './gamerule.controller';
import { GameruleFacade } from './entities/gameruleFacade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([GameruleFacade])
  ],
  controllers: [GameruleController],
  providers: [GameruleService],
  exports: [GameruleService]
})
export class GameruleModule {}
