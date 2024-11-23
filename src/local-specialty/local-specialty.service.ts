import { Injectable } from '@nestjs/common';
import { CreateLocalSpecialtyDto } from './dto/create-local-specialty.dto';
import { UpdateLocalSpecialtyDto } from './dto/update-local-specialty.dto';

@Injectable()
export class LocalSpecialtyService {
  create(createLocalSpecialtyDto: CreateLocalSpecialtyDto) {
    return 'This action adds a new localSpecialty';
  }

  findAll() {
    return `This action returns all localSpecialty`;
  }

  findOne(id: number) {
    return `This action returns a #${id} localSpecialty`;
  }

  update(id: number, updateLocalSpecialtyDto: UpdateLocalSpecialtyDto) {
    return `This action updates a #${id} localSpecialty`;
  }

  remove(id: number) {
    return `This action removes a #${id} localSpecialty`;
  }
}
