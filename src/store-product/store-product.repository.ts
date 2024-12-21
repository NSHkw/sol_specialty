import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { StoreProductQuery, StoreProductSelect } from './types/store-product.type';

@Injectable()
export class StoreProductRepository {
  constructor(
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
  ) {}

  async create(productData: Partial<StoreProduct>): Promise<StoreProduct> {
    const product = this.storeProductRepository.create(productData);
    return this.storeProductRepository.save(product);
  }

  async findAllProductByStoreId(store_id: number): Promise<StoreProduct[]> {
    const select: StoreProductSelect = {
      id: true,
      product_name: true,
      description: true,
      price: true,
      stock: true,
      grade: true,
      type: true,
      local_specialty: {
        id: true,
        name: true,
      },
    };

    return this.storeProductRepository.find({
      where: { store_id },
      relations: ['local_specialty'],
      select,
    });
  }

  async findOne(query: StoreProductQuery): Promise<StoreProduct | null> {
    // ID 값들이 유효한 숫자인지 확인
    if ((query.id && isNaN(query.id)) || (query.store_id && isNaN(query.store_id))) {
      throw new BadRequestException('유효하지 않은 ID 값입니다.');
    }

    return this.storeProductRepository.findOne({
      where: query,
      relations: ['local_specialty'],
    });
  }

  async findById(product_id: number, store_id: number): Promise<StoreProduct | null> {
    return this.findOne({ id: product_id, store_id });
  }

  async update(product_id: number, productData: Partial<StoreProduct>): Promise<void> {
    if (!product_id || isNaN(product_id)) {
      throw new BadRequestException('유효하지 않은 상품 ID입니다.');
    }

    await this.storeProductRepository.update(product_id, productData);
  }

  async delete(storeProduct: StoreProduct): Promise<void> {
    await this.storeProductRepository.remove(storeProduct);
  }

  async updateStock(product_id: number, quantity: number): Promise<void> {
    await this.storeProductRepository
      .createQueryBuilder()
      .update(StoreProduct)
      .set({ stock: () => `stock + ${quantity}` })
      .where('id = :id', { id: product_id })
      .execute();
  }

  async checkStock(product_id: number, quantity: number): Promise<boolean> {
    const product = await this.findOne({ id: product_id });
    return product ? product.stock >= quantity : false;
  }
}
