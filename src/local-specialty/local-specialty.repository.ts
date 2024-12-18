import { InjectRepository } from '@nestjs/typeorm';
import { LocalSpecialty } from './entities/local-specialty.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalSpecialtyRepository {
  constructor(
    @InjectRepository(LocalSpecialty)
    private readonly localSpeicaltyRepository: Repository<LocalSpecialty>,
  ) {}

  async findById(id: number): Promise<LocalSpecialty | null> {
    return this.localSpeicaltyRepository.findOne({
      where: { id },
    });
  }

  async findOne(id: number): Promise<LocalSpecialty | null> {
    return this.localSpeicaltyRepository.findOne({
      where: { id },
      relations: ['store_products'],
    });
  }

  async findAll(): Promise<LocalSpecialty[]> {
    return this.localSpeicaltyRepository.find();
  }
}
