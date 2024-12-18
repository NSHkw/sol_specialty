// src/store/store.repository.ts
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { SearchResult, StoreBaseInfo, StoreDetailInfo } from './types/store.type';

export class StoreRepository {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(storeData: Partial<Store>): Promise<Store> {
    const store = this.storeRepository.create(storeData);
    return this.storeRepository.save(store);
  }

  async update(id: number, storeData: Partial<Store>): Promise<void> {
    await this.storeRepository.update(id, storeData);
  }

  async delete(id: number): Promise<void> {
    await this.storeRepository.delete(id);
  }

  async search(keyword: string, page: number, limit: number): Promise<SearchResult> {
    try {
      const query = this.storeRepository
        .createQueryBuilder('store')
        .leftJoinAndSelect('store.store_products', 'store_products')
        .leftJoinAndSelect('store_products.local_specialty', 'local_specialty')
        .leftJoinAndSelect('store.reviews', 'reviews')
        .select([
          'store.id',
          'store.name',
          'store.rating',
          'store.review_count',
          'store.image',
          'store_products.price',
          'local_specialty.id',
          'local_specialty.name',
          'reviews.id',
          'reviews.rating',
          'reviews.content',
        ]);

      if (keyword) {
        query.where('(store.name LIKE :keyword OR local_specialty.name LIKE :keyword)', {
          keyword: `%${keyword}%`,
        });
      }

      const [stores, total] = await Promise.all([
        query
          .take(limit)
          .skip((page - 1) * limit)
          .getMany(),
        query.getCount(),
      ]);

      return {
        stores: this.mapToStoreInfoList(stores),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error(error);
      throw new Error('상점 검색 중 오류 발생');
    }
  }

  async findByName(name: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { name },
    });
  }

  async findOneById(store_id: number): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { id: store_id },
    });
  }

  async findByUserId(userId: number): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { user_id: userId },
    });
  }

  async findAllStores(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: {
        store_products: {
          local_specialty: true,
        },
        reviews: true,
      },
      select: {
        id: true,
        name: true,
        rating: true,
        review_count: true,
        store_products: {
          price: true,
          local_specialty: { id: true, name: true },
        },
      },
    });
  }

  async findStoreDetailById(id: number): Promise<Store | null> {
    return this.storeRepository.findOne({
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
        reviews: {
          id: true,
          rating: true,
          content: true,
        },
      },
    });
  }

  mapToStoreInfoList(stores: Store[]): StoreBaseInfo[] {
    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      local_specialties:
        store.store_products?.map((product) => ({
          id: product.local_specialty?.id,
          name: product.local_specialty?.name,
          price: product.price,
        })) || [],
      review_stats: {
        average_rating: store.rating || 0,
        total_reviews: store.review_count || 0,
      },
    }));
  }

  mapToStoreDetailInfo(store: Store): StoreDetailInfo {
    const baseInfo = this.mapToStoreInfoList([store])[0];

    return {
      ...baseInfo,
      description: store.description,
      address: store.address,
      phone_number: store.contact,
      image: store.image,
      location: [store.longitude, store.latitude],
    };
  }
}
