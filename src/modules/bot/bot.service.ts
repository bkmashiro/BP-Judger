import { Injectable } from '@nestjs/common';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bot } from './entities/bot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BotService {

  constructor(
    @InjectRepository(Bot) 
    private botRepository: Repository<Bot>
  ) {}


  async create(createBotDto: CreateBotDto) {
    const bot = new Bot()
    bot.name = 'test'
    bot.lang = 'c++'
    bot.code = {
      src: `
#include "bot.h"

class MyBot : public Bot {
  int res = 114510;
public:
  using Bot::Bot;
  json Move(json &ctx) override {
    json reply;
    reply["guess"] = res++;
    LOG("MyBot Guessed " << res)
    return reply;
  }
};

int main() {
  std::unique_ptr<MyBot> myBot = std::unique_ptr<MyBot>(new MyBot("10.97.10.1:8848", "d9668c37-6c28-4b46-8c88-6d550da1410d"));
  myBot->Ready();
  LOG("MyBot End")
  return 0;
}
      `,
      filename: 'test.cc',
      version: 'c++14',
      tags: ['test'],
      lang: 'c++',
    }
    bot.do_compile = true
    bot.compile_pipeline_name = 'cmake_g++_c++14_grpc_player_compile'
    bot.run_pipeline_name = 'run_exec'
    bot.tags = ['test']
    bot.by = 1

    await this.botRepository.save(bot)
  }

  findAll() {
    return `This action returns all bot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bot`;
  }

  update(id: number, updateBotDto: UpdateBotDto) {
    return `This action updates a #${id} bot`;
  }

  remove(id: number) {
    return `This action removes a #${id} bot`;
  }
}
