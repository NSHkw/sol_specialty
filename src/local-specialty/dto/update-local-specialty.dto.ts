import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalSpecialtyDto } from './create-local-specialty.dto';

export class UpdateLocalSpecialtyDto extends PartialType(CreateLocalSpecialtyDto) {}
