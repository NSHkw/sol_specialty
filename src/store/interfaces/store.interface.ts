import { User } from '../../user/entities/user.entity';
import { CreateStoreDto } from '../dto/create-store.dto';
import { SearchStoreDto } from '../dto/search-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';
import { SearchResult, StoreBaseInfo, StoreDetailInfo, StoreResponse } from '../types/store.type';

export interface StoreInterface {
  createStore(user: User, createStoreDto: CreateStoreDto): Promise<StoreResponse<Store>>;

  findStoreByUserId(user_id: number): Promise<Store>;

  updateStoreInfo(
    store_id: number,
    user: User,
    updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponse>;

  deleteStore(store_id: number, user: User): Promise<StoreResponse>;

  findAllStores(): Promise<StoreBaseInfo[]>;

  findStoreByStoreId(id: number): Promise<StoreDetailInfo>;

  searchStore(searchDto: SearchStoreDto): Promise<SearchResult>;
}
