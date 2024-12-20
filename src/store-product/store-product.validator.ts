// src/store-product/store-product.validator.ts
import { StoreValidator } from './../store/store.validator';
import { LocalSpecialtyRepository } from '../local-specialty/local-specialty.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LocalSpecialty } from '../local-specialty/entities/local-specialty.entity';
import { Store } from '../store/entities/store.entity';

@Injectable()
export class StoreProductValidator {
  constructor(
    private readonly localSpecialtyRepository: LocalSpecialtyRepository,
    private readonly storeValidator: StoreValidator,
  ) {}

  async validateLocalSpecialty(local_specialty_id: number): Promise<LocalSpecialty> {
    this.validateIds({ local_specialty_id }, ['local_specialty_id']);

    const localSpecialty = await this.localSpecialtyRepository.findOne(local_specialty_id);
    if (!localSpecialty) {
      throw new NotFoundException('지역 특산품을 찾을 수 없습니다.');
    }

    return localSpecialty;
  }

  async validateStoreProduct(
    store_id: number,
    user_id: number,
    local_specialty_id: number,
  ): Promise<{ store: Store; localSpecialty: LocalSpecialty }> {
    // 모든 ID 유효성 검사
    this.validateIds(
      {
        store_id,
        user_id,
        local_specialty_id,
      },
      ['store_id', 'user_id', 'local_specialty_id'],
    );

    const store = await this.storeValidator.validateStoreOwner(store_id, user_id);
    const localSpecialty = await this.validateLocalSpecialty(local_specialty_id);

    return { store, localSpecialty };
  }

  validateIds(ids: Record<string, number | undefined>, requiredIds: string[] = []): void {
    for (const [key, value] of Object.entries(ids)) {
      // 필수 ID인 경우
      if (requiredIds.includes(key)) {
        if (!value || isNaN(value)) {
          throw new BadRequestException(`${key}는 필수이며 유효한 숫자여야 합니다.`);
        }
      }
      // 선택적 ID인 경우 (값이 제공된 경우에만 검증)
      else if (value !== undefined && (isNaN(value) || value <= 0)) {
        throw new BadRequestException(`${key}는 0보다 큰 유효한 숫자여야 합니다.`);
      }
    }
  }
}
