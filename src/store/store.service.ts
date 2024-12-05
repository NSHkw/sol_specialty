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
import { AuthUtils } from 'src/common/utils/auth.utils';

// TODO: 상점 판매량 확인 함수 구현
@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private readonly storeRepository: Repository<Store>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // 상점 생성, 수정, 삭제, 판매량 확인, 모든 상점 조회, 특정 상점 상세 조회, 상점 검색

  // 상점 생성
  async createStore(user: User, createStoreDto: CreateStoreDto) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const { name } = createStoreDto;

    // 현재 사용자의 활성화된 상점이 있는지 확인
    const existingUserStore = await this.storeRepository.findOne({
      where: { user_id: user.id },
    });

    if (existingUserStore) {
      throw new ConflictException('이미 상점 보유 중인 사용자');
    }

    // 같은 이름의 활성화된 상점이 있는지 확인
    const existedStore = await this.storeRepository.findOne({
      where: { name },
    });

    if (existedStore) {
      throw new ConflictException('이미 존재하는 이름의 상점');
    }

    // 새로운 상점 생성
    const newStore = await this.storeRepository.save({
      ...createStoreDto,
      user_id: user.id,
    });

    const storeOwner = await this.userRepository.findOne({
      where: { id: user.id },
      select: { nickname: true },
    });

    return `${storeOwner.nickname}이 ${name}으로 상점 생성`;
  }

  // 상점 정보 수정
  async updateStore(id: number, user: User, updateStoreDto: UpdateStoreDto) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const existedStore = await this.storeRepository.findOne({
      where: { id },
    });

    if (!existedStore) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (existedStore.user_id !== user.id) {
      throw new ForbiddenException('상점 수정에 대한 권한 X');
    }

    const { name } = updateStoreDto;
    if (name && name !== existedStore.name) {
      const existingStore = await this.storeRepository.findOne({
        where: { name },
      });

      if (existingStore) {
        throw new ConflictException('이미 존재하는 상점 이름');
      }
    }

    await this.storeRepository.update(id, updateStoreDto);

    return `${existedStore.name} 상점 정보 수정`;
  }

  // 상점 삭제
  async deleteStore(id: number, user: User) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const store = await this.storeRepository.findOne({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (store.user_id !== user.id) {
      throw new ForbiddenException('상점 삭제에 대한 권한 X');
    }

    await this.storeRepository.delete(id);

    return `${store.name} 상점이 삭제됨`;
  }

  // 상점 판매량 확인
  async checkStoreSales(id: number) {}

  // 사이트에 존재하는 모든 상점 조회
  // 모든 상점들 조회 시 각 상점 이름, 상점에서 판매하는 특산품, 리뷰 평균 점수, 리뷰 개수를 보여줘야 함
  async findAllStores() {
    const stores = await this.storeRepository.find({
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

    if (!stores) {
      throw new NotFoundException('존재하는 상점 없음');
    }

    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      local_specialties: (store.store_products || []).map((product) => ({
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
      where: { id },
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
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const { keyword } = searchDto;

    const query = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.store_products', 'store_products')
      .leftJoinAndSelect('store_products.local_specialty', 'local_specialty')
      .select([
        'store.id',
        'store.name',
        'store.rating',
        'store.review_count',
        'store_products.price',
        'local_specialty.id',
        'local_specialty.name',
      ])
      .where('store.deleted_at IS NULL');

    if (keyword && keyword !== '') {
      query.andWhere('(store.name LIKE :keyword OR local_specialty.name LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    try {
      const total = await query.getCount();
      const stores = await query
        .take(limit)
        .skip((page - 1) * limit)
        .getMany();

      console.log('Search keyword:', keyword); // 디버깅용
      console.log('Found stores:', stores); // 디버깅용

      const formattedStores = stores.map((store) => ({
        id: store.id,
        name: store.name,
        localSpecialties:
          store.store_products?.map((product) => ({
            id: product.local_specialty?.id,
            name: product.local_specialty?.name,
            price: product.price,
          })) || [],
        reviewStats: {
          averageRating: store.rating || 0,
          totalReviews: store.review_count || 0,
        },
      }));

      return {
        stores: formattedStores,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}
