import { SearchLocalSpecialtyDto } from '../dto/search-local-specialty.dto';
import { LocalSpecialty } from '../entities/local-specialty.entity';
import { Region } from '../types/region.type';

export interface LocalSpecialtyServiceInterface {
  findAll(): Promise<LocalSpecialty[]>;
  findByRegion(region: Region): Promise<LocalSpecialty[]>;
  findById(id: number): Promise<LocalSpecialty>;
  search(searchDto: SearchLocalSpecialtyDto): Promise<LocalSpecialty[]>;
}
