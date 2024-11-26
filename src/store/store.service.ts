import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SearchStoreDto } from './dto/search-store.dto';

// TODO: 상점 판매량 확인 함수 구현
@Injectable()
export class StoreService {
  constructor(@InjectRepository(Store) private readonly storeRepository: Repository<Store>) {}

  // 상점 생성, 수정, 삭제, 판매량 확인, 모든 상점 조회, 특정 상점 상세 조회, 상점 검색

  // 상점 생성
  async createStore(user: User, createStoreDto: CreateStoreDto) {
    const { name } = createStoreDto;

    const existingUserStore = await this.storeRepository.findOne({
      where: { user_id: user.id, deleted_at: null },
    });

    if (existingUserStore) {
      throw new ConflictException('이미 상점을 보유하고 있는 사용자입니다.');
    }

    const existedStore = await this.storeRepository.findOne({
      where: { name, deleted_at: null },
    });

    if (existedStore) {
      throw new ConflictException('이미 존재하는 이름의 상점입니다.');
    }

    await this.storeRepository.save({ ...createStoreDto, user_id: user.id });

    return `${user.nickname}님이 ${name}으로 상점을 생성하였습니다.`;
  }

  // 상점 정보 수정
  async updateStore(id: number, user: User, updateStoreDto: UpdateStoreDto) {
    const existedStore = await this.storeRepository.findOne({
      where: { id, deleted_at: null },
    });

    if (!existedStore) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (existedStore.user_id !== user.id) {
      throw new ForbiddenException('상점 수정에 대한 권한이 없다');
    }

    const { name } = updateStoreDto;
    if (name && name !== existedStore.name) {
      const existingStore = await this.storeRepository.findOne({
        where: { name, deleted_at: null },
      });

      if (existingStore) {
        throw new ConflictException('이미 존재하는 상점 이름');
      }
    }

    await this.storeRepository.update(id, updateStoreDto);

    return `${existedStore.name} 상점 정보를 수정하였습니다.`;
  }

  // 상점 삭제
  async deleteStore(id: number, user: User) {
    const store = await this.storeRepository.findOne({
      where: { id, deleted_at: null },
    });

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (store.user_id !== user.id) {
      throw new ForbiddenException('상점 삭제에 대한 권한이 없다');
    }

    await this.storeRepository.softDelete(id);

    return `${store.name} 상점이 삭제됨`;
  }

  // 상점 판매량 확인
  async checkStoreSales(id: number) {}

  // 사이트에 존재하는 모든 상점 조회
  // 모든 상점들 조회 시 각 상점 이름, 상점에서 판매하는 특산품, 리뷰 평균 점수, 리뷰 개수를 보여줘야 함
  async findAllStores() {
    const stores = await this.storeRepository.find({
      where: { deleted_at: null },
      relations: {
        // store와 연관 관계 있는 테이블과 join
        store_products: {
          //storeProduct 테이블과 join
          local_specialty: true, // localSpecialty 테이블과 join
        },
        reviews: true, // review 테이블과 join
      },
      select: {
        id: true,
        name: true,
        rating: true,
        review_count: true,
        store_products: {
          local_specialty: { id: true, name: true },
        },
      },
    });

    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      local_specialties: store.store_products.map((product) => ({
        id: product.local_specialty.id,
        name: product.local_specialty.name,
      })),
      review_stats: {
        // 상점의 평점 출력
        average_rating: store.rating,
        total_reviews: store.review_count,
      },
    }));
  }

  // 특정 상점 상세 조회
  // 특정 상점 상세 조회 시 상점 이름, 상점 소개, 상점에서 판매하는 모든 특산품, 리뷰 평균 점수, 주소, 연락처, 이미지, 위도, 경도를 보여줘야 함
  async findStoreById(id: number) {
    const stores = await this.storeRepository.find({
      where: { id, deleted_at: null },
      relations: {
        store_products: {
          local_specialty: true,
        },
        reviews: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        contact: true,
        image: true,
        latitude: true,
        longitude: true,
        rating: true,
        store_products: {
          price: true,
          local_specialty: { id: true, name: true },
        },
      },
    });

    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      description: store.description,
      address: store.address,
      phone_number: store.contact,
      image: store.image,
      location: [store.longitude, store.latitude],
      local_specialties: store.store_products.map((product) => ({
        id: product.local_specialty.id,
        name: product.local_specialty.name,
        price: product.price,
      })),
      review_stats: {
        average_rating: store.rating,
      },
    }));
  }

  // 상점 검색 (상점 이름 or 특산품 이름으로 검색)
  async search(searchDto: SearchStoreDto) {
    const { keyword, page, limit } = searchDto;

    const query = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.store_products', 'store_products')
      .leftJoinAndSelect('store_products.local_specialty', 'local_specialty')
      .leftJoinAndSelect('store.reviews', 'reviews')
      .select(['store.id', 'store.name', 'store_products', 'local_specialty', 'reviews'])
      .where('store.deleted_at IS NULL');

    if (keyword) {
      query.andWhere('(store.name LIKE :keyword OR local_specialty.name LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    const pagenation = (page - 1) * limit;
    query.skip(pagenation).take(limit);

    const [stores, total] = await query.getManyAndCount();

    const formattedStores = stores.map((store) => ({
      id: store.id,
      name: store.name,
      localSpecialties: store.store_products.map((product) => ({
        id: product.local_specialty.id,
        name: product.local_specialty.name,
        price: product.price,
      })),
      reviewStats: {
        averageRating: store.rating,
        totalReviews: store.review_count,
      },
    }));

    return {
      stores: formattedStores,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
