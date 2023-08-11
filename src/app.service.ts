import { Injectable, Logger } from '@nestjs/common';
import { judgerMeta_m001_v001 as meta } from './configs/meta';

@Injectable()
export class AppService {
  getHello(): string {
    Logger.log('Hello World!');
    return 'Hello World!';
  }

  getJudgerMeta(): any {
    return meta
  }
}

