// src/store-product/store-product.validator.ts
import { StoreValidator } from './../store/store.validator';
import { LocalSpecialtyRepository } from 'src/local-specialty/local-specialty.repository';
import { StoreProductRepository } from './store-product.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class StoreProductValidator {
  constructor(
    private readonly storeProductRepository: StoreProductRepository,
    private readonly localSpecialtyRepository: LocalSpecialtyRepository,
    private readonly storeValidator: StoreValidator,
  ) {}

  async validateLocalSpecialty(local_specialty_id: number): Promise<LocalSpecialty> {
    const localSpecialty = await this.localSpecialtyRepository.findOne(local_specialty_id);

    if (!localSpecialty) {
      throw new NotFoundException('지역 특산품 찾을 수 없음');
    }

    return localSpecialty;
  }

  async validateStoreProduct(
    store_id: number,
    user_id: number,
    local_specialty_id: number,
  ): Promise<{ store: Store; localSpecialty: LocalSpecialty }> {
    const store = await this.storeValidator.validateStoreOwner(store_id, user_id);

    const localSpecialty = await this.validateLocalSpecialty(local_specialty_id);

    return { store, localSpecialty };
  }
}
