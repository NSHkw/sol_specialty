import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { Repository } from 'typeorm';

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
    return this.storeProductRepository.find({
      where: { store_id },
      relations: ['local_specialty'],
      select: {
        id: true,
        product_name: true,
        price: true,
        grade: true,
        type: true,
        local_specialty: { id: true, name: true },
      },
    });
  }

  async findOne(product_id: number, store_id: number): Promise<StoreProduct | null> {
    return this.storeProductRepository.findOne({
      where: { id: product_id, store_id },
      relations: ['local_specialty'],
    });
  }

  async update(product_id: number, productData: Partial<StoreProduct>): Promise<void> {
    await this.storeProductRepository.update(product_id, productData);
  }

  async delete(storeProduct: StoreProduct): Promise<void> {
    await this.storeProductRepository.remove(storeProduct);
  }
}
