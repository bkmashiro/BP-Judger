import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';
import { version } from 'os';

@Injectable()
export class PlayerService {
  async create(createPlayerDto: CreatePlayerDto) {

    const player = await Player.newProxyPlayer("test", ["test"], {
      lang: "c++",
      src: "#include <iostream>\nint main() { std::cout << \"Hello World!\" << std::endl; return 0; }",
      filename: "main.cpp",
      version: "c++11",
      tags: ["test"]
    })

    await player.prepare()

    return 'This action adds a new player';
  }

  findAll() {
    return `This action returns all player`;
  }

  findOne(id: number) {
    return `This action returns a #${id} player`;
  }

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
