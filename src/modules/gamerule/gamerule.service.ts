import { Injectable } from '@nestjs/common';
import { CreateGameruleDto } from './dto/create-gamerule.dto';
import { UpdateGameruleDto } from './dto/update-gamerule.dto';

@Injectable()
export class GameruleService {
  create(createGameruleDto: CreateGameruleDto) {
    return 'This action adds a new gamerule';
  }

  findAll() {
    return `This action returns all gamerule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gamerule`;
  }

  update(id: number, updateGameruleDto: UpdateGameruleDto) {
    return `This action updates a #${id} gamerule`;
  }

  remove(id: number) {
    return `This action removes a #${id} gamerule`;
  }
}
