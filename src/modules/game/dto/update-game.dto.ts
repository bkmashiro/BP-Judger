import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto_test } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto_test) {}
