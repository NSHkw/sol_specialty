// src/store-product/interfaces/store-product.interface.ts
import { User } from '../../user/entities/user.entity';
import { UpdateStoreProductDto } from '../dto/update-store-product.dto';
import { StoreProduct } from '../entities/store-product.entity';
import { StoreProductResponse } from '../types/store-product.type';
import { CreateStoreProductDto } from '../dto/create-store-product.dto';

export interface StoreProductInterface {
  createStoreProductInStore(
    user: User,
    store_id: number,
    createStoreProductDto: CreateStoreProductDto,
  ): Promise<StoreProductResponse<StoreProduct>>;

  findAllInStore(store_id: number): Promise<StoreProduct[]>;

  findOneProductInStore(product_id: number, store_id: number): Promise<StoreProduct>;

  updateProductInfoInStore(
    user: User,
    product_id: number,
    store_id: number,
    updateStoreProductDto: UpdateStoreProductDto,
  ): Promise<StoreProductResponse<StoreProduct>>;

  deleteStoreProductInStore(
    product_id: number,
    store_id: number,
    user: User,
  ): Promise<StoreProductResponse<StoreProduct>>;
}
