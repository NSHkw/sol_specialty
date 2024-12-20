import { FindOptionsWhere } from 'typeorm';
import { Region } from './region.type';
import { LocalSpecialty } from '../entities/local-specialty.entity';

export type SearchConditions = {
  name?: any;
  region?: Region;
};

export type SearchWhereConditions = FindOptionsWhere<LocalSpecialty>;

export type FindSpecialtyOptions = {
  id?: number;
  region?: Region;
  withStoreProducts?: boolean;
  selectDetail?: boolean;
  customConditions?: SearchConditions;
};
