import { SearchLocalSpecialtyDto } from '../local-specialty/dto/search-local-specialty.dto';
import { LocalSpecialty } from '../local-specialty/entities/local-specialty.entity';
import { Region } from '../local-specialty/types/region.type';

export interface LocalSpecialtyServiceInterface {
  findAll(): Promise<LocalSpecialty[]>;
  findByRegion(region: Region): Promise<LocalSpecialty[]>;
  findById(id: number): Promise<LocalSpecialty>;
  search(searchDto: SearchLocalSpecialtyDto): Promise<LocalSpecialty[]>;
}
