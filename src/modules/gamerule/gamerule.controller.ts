import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameruleService } from './gamerule.service';
import { CreateGameruleDto } from './dto/create-gamerule.dto';
import { UpdateGameruleDto } from './dto/update-gamerule.dto';

@Controller('gamerule')
export class GameruleController {
  constructor(private readonly gameruleService: GameruleService) {}

  @Post()
  create(@Body() createGameruleDto: CreateGameruleDto) {
    return this.gameruleService.create(createGameruleDto);
  }

  @Get()
  findAll() {
    return this.gameruleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameruleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameruleDto: UpdateGameruleDto) {
    return this.gameruleService.update(+id, updateGameruleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameruleService.remove(+id);
  }
}
