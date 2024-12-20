// src/store/store.validator.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { UserRepository } from '../user/user.repository';
import { Store } from './entities/store.entity';

@Injectable()
export class StoreValidator {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async validateNewStore(user_id: number, name: string): Promise<void> {
    const user = await this.userRepository.findOneWithRelations(user_id, ['store']);

    if (!user) {
      throw new NotFoundException('사용자 찾을 수 없음');
    }

    if (user.store) {
      throw new ConflictException('이미 상점 보유 중인 사용자');
    }

    const existingStore = await this.storeRepository.findByName(name);
    if (existingStore) {
      throw new ConflictException('이미 존재하는 이름의 상점');
    }
  }

  async validateStoreOwner(store_id: number, user_id: number): Promise<Store> {
    const store = await this.storeRepository.findOneById(store_id);

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (store.user_id !== user_id) {
      throw new ForbiddenException('상점 권한 X');
    }

    return store;
  }
}
