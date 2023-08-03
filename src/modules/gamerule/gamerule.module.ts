import { Module } from '@nestjs/common';
import { GameruleService } from './gamerule.service';
import { GameruleController } from './gamerule.controller';
import { GameruleInstance } from './entities/gamerule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([GameruleInstance])
  ],
  controllers: [GameruleController],
  providers: [GameruleService]
})
export class GameruleModule {}
