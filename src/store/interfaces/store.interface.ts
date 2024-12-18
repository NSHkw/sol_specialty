import { User } from '../../user/entities/user.entity';
import { CreateStoreDto } from '../dto/create-store.dto';
import { SearchStoreDto } from '../dto/search-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';
import {
  SearchResult,
  StoreBaseInfo,
  StoreDetailInfo,
  StoreServiceResponse,
} from '../types/store.type';

export interface StoreServiceInterface {
  createStore(user: User, createStoreDto: CreateStoreDto): Promise<StoreServiceResponse<Store>>;
  findStoreByUserId(user_id: number): Promise<Store>;
  updateStore(
    store_id: number,
    user: User,
    updateStoreDto: UpdateStoreDto,
  ): Promise<StoreServiceResponse>;
  deleteStore(store_id: number, user: User): Promise<StoreServiceResponse>;
  findAllStores(): Promise<StoreBaseInfo[]>;
  findStoreById(id: number): Promise<StoreDetailInfo>;
  search(searchDto: SearchStoreDto): Promise<SearchResult>;
}
