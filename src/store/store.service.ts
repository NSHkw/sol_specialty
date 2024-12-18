// src/store/store.service.ts
import { StoreValidator } from './store.validator';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
import { User } from '../user/entities/user.entity';
import { SearchStoreDto } from './dto/search-store.dto';
import { AuthUtils } from '../common/utils/auth.utils';
import { StoreInterface } from './interfaces/store.interface';
import { StoreRepository } from './store.repository';
import { SearchResult, StoreBaseInfo, StoreDetailInfo, StoreResponse } from './types/store.type';

// TODO: 상점 판매량 확인 함수 구현
@Injectable()
export class StoreService implements StoreInterface {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeValidator: StoreValidator,
  ) {}

  // 상점 생성, 수정, 삭제, 판매량 확인, 모든 상점 조회, 특정 상점 상세 조회, 상점 검색

  // 상점 생성
  async createStore(user: User, createStoreDto: CreateStoreDto): Promise<StoreResponse<Store>> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const { name } = createStoreDto;

    await this.storeValidator.validateNewStore(user.id, name);

    // 새로운 상점 생성
    const newStore = await this.storeRepository.create({
      ...createStoreDto,
      user_id: user.id,
    });

    return {
      message: `${user.nickname}이 ${name}으로 상점 생성`,
      data: newStore,
    };
  }

  // 상점 정보 수정
  async updateStoreInfo(
    store_id: number,
    user: User,
    updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponse> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const store = await this.storeValidator.validateStoreOwner(store_id, user.id);

    if (updateStoreDto.name && updateStoreDto.name !== store.name) {
      const existingStore = await this.storeRepository.findByName(updateStoreDto.name);
      if (existingStore) {
        throw new ConflictException('이미 존재하는 상점 이름');
      }
    }

    await this.storeRepository.update(store_id, updateStoreDto);

    return { message: `${store.name} 상점 정보가 수정되었습니다.` };
  }

  // 상점 삭제
  async deleteStore(store_id: number, user: User): Promise<StoreResponse> {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const store = await this.storeValidator.validateStoreOwner(store_id, user.id);

    await this.storeRepository.delete(store_id);

    return { message: `${store.name} 삭제` };
  }

  async findStoreByUserId(user_id: number): Promise<Store> {
    const store = await this.storeRepository.findByUserId(user_id);

    if (!store) {
      throw new NotFoundException('해당 사용자의 상점이 존재하지 않습니다.');
    }

    return store;
  }

  // 사이트에 존재하는 모든 상점 조회
  // 모든 상점들 조회 시 각 상점 이름, 상점에서 판매하는 특산품, 리뷰 평균 점수, 리뷰 개수를 보여줘야 함
  async findAllStores(): Promise<StoreBaseInfo[]> {
    const stores = await this.storeRepository.findAllStores();

    if (!stores.length) {
      throw new NotFoundException('존재하는 상점 없음');
    }

    return this.storeRepository.mapToStoreInfoList(stores);
  }

  // 특정 상점 상세 조회
  // 특정 상점 상세 조회 시 상점 이름, 상점 소개, 상점에서 판매하는 모든 특산품, 리뷰 평균 점수, 주소, 연락처, 이미지, 위도, 경도를 보여줘야 함
  async findStoreByStoreId(id: number): Promise<StoreDetailInfo> {
    const store = await this.storeRepository.findStoreDetailById(id);

    if (!store) {
      throw new NotFoundException('해당 사용자의 상점 존재 X');
    }

    return this.storeRepository.mapToStoreDetailInfo(store);
  }

  // 상점 검색 (상점 이름 or 특산품 이름으로 검색)
  async searchStore(searchDto: SearchStoreDto): Promise<SearchResult> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const { keyword } = searchDto;

    return this.storeRepository.search(keyword, page, limit);
  }
}
