import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Game } from './entities/game.entity';

@Processor('game')
export class GameConsumer {
  @Process('game')
  async transcode(job: Job<unknown>) {
    let progress = 0;
    //setup
    job.progress(++progress);
    const game = new Game();
    //preparing
    job.progress(++progress);

    //running
    job.progress(++progress);

    //finished
    job.progress(++progress);

  }
}