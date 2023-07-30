import { Module } from '@nestjs/common';
import { GameruleService } from './gamerule.service';
import { GameruleController } from './gamerule.controller';

@Module({
  controllers: [GameruleController],
  providers: [GameruleService]
})
export class GameruleModule {}
