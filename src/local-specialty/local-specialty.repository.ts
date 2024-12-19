import { InjectRepository } from '@nestjs/typeorm';
import { LocalSpecialty } from './entities/local-specialty.entity';
import { Like, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  FindSpecialtyOptions,
  SearchConditions,
  SearchWhereConditions,
} from './types/local-specialty.type';
import { Region } from './types/region.type';

@Injectable()
export class LocalSpecialtyRepository {
  constructor(
    @InjectRepository(LocalSpecialty)
    private readonly localSpecialtyRepository: Repository<LocalSpecialty>,
  ) {}

  async findById(id: number, relations: string[] = []): Promise<LocalSpecialty | null> {
    return this.localSpecialtyRepository.findOne({
      where: { id },
      relations,
    });
  }

  async findOne(id: number): Promise<LocalSpecialty | null> {
    const results = await this.findSpecialties({
      id,
      withStoreProducts: true,
    });
    return results[0] || null;
  }

  async findAll(): Promise<LocalSpecialty[]> {
    return this.findSpecialties({});
  }

  async findByRegion(region: Region): Promise<LocalSpecialty[]> {
    return this.findSpecialties({
      region,
      withStoreProducts: true,
    });
  }

  async findSpecialties(options: FindSpecialtyOptions): Promise<LocalSpecialty[]> {
    const {
      id,
      region,
      withStoreProducts = false,
      selectDetail = false,
      customConditions,
    } = options;

    const whereConditions: SearchWhereConditions = {};

    if (id) whereConditions.id = id;
    if (region) whereConditions.region = region;
    if (customConditions?.keyword) {
      whereConditions.name = Like(`%${customConditions.keyword}%`);
    }
    if (customConditions?.region) {
      whereConditions.region = customConditions.region;
    }

    return this.localSpecialtyRepository.find({
      where: whereConditions,
      select: selectDetail ? this.getDetailSelectFields() : this.getDefaultSelectFields(),
      relations: withStoreProducts ? ['store_products'] : [],
    });
  }

  async search(conditions: SearchConditions): Promise<LocalSpecialty[]> {
    return this.findSpecialties({ customConditions: conditions });
  }

  private getDefaultSelectFields() {
    return {
      id: true,
      name: true,
      season_info: true,
      region: true,
    };
  }

  private getDetailSelectFields() {
    return {
      id: true,
      name: true,
      description: true,
      season_info: true,
      region: true,
    };
  }
}
