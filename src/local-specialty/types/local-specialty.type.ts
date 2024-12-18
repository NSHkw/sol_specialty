import { Region } from './region.type';

export type SearchConditions = {
  name?: any;
  region?: Region;
};

export type FindSpecialtyOptions = {
  id?: number;
  region?: Region;
  withStoreProducts?: boolean;
  selectDetail?: boolean;
};
