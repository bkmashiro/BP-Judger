import { Injectable } from '@nestjs/common';
import { judgerMeta_m001_v001 as meta } from './configs/meta';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getJudgerMeta(): any {
    return meta
  }
}

