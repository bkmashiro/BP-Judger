import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerInstance } from './entities/player.entity';
import { version } from 'os';

@Injectable()
export class PlayerService {
  async create(createPlayerDto: CreatePlayerDto) {

    const player = await PlayerInstance.newProxyPlayer("test", ["test"], {
      lang: "c++",
      src: "#include <iostream>\nint main() { std::cout << \"Hello World!\" << std::endl; return 0; }",
      filename: "test.cc",
      version: "c++14",
      tags: ["test"],
      pipeline_name: 'cmake_g++_c++14_grpc_player_compile'
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
