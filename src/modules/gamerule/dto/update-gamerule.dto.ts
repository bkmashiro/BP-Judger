import { PartialType } from '@nestjs/mapped-types';
import { CreateGameruleDto } from './create-gamerule.dto';

export class UpdateGameruleDto extends PartialType(CreateGameruleDto) {}
