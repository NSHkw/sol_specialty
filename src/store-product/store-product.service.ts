// src/store-product/store-product.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { User } from '../user/entities/user.entity';
import { StoreProduct } from './entities/store-product.entity';
import { AuthUtils } from '../common/utils/auth.utils';
import { StoreProductInterface } from './interfaces/store-product.interface';
import { StoreProductRepository } from './store-product.repository';
import { StoreProductResponse } from './types/store-product.type';
import { StoreProductValidator } from './store-product.validator';

@Injectable()
export class StoreProductService implements StoreProductInterface {
  constructor(
    private readonly storeProductRepository: StoreProductRepository,
    private readonly storeProductValidator: StoreProductValidator,
  ) {}

  /**
   * 상점 내 상품 등록
   * @param user
   * @param store_id
   * @param createStoreProductDto
   * @returns
   */
  async createStoreProductInStore(
    user: User,
    store_id: number,
    createStoreProductDto: CreateStoreProductDto,
  ): Promise<StoreProductResponse<StoreProduct>> {
    AuthUtils.validateLogin(user);

    const { local_specialty_id, stock } = createStoreProductDto;

    await this.storeProductValidator.validateStoreProduct(store_id, user.id, local_specialty_id);

    const product = await this.storeProductRepository.create({
      ...createStoreProductDto,
      store_id,
      sold_out: !stock || stock <= 0,
    });

    return {
      message: '상품 등록',
      data: product,
    };
  }

  /**
   * 상점 내 상품들 조회
   * @param store_id
   * @returns
   */
  async findAllInStore(store_id: number): Promise<StoreProduct[]> {
    return this.storeProductRepository.findAllProductByStoreId(store_id);
  }

  /**
   * 상점 내 상품 하나 상세 조회
   * @param product_id
   * @param store_id
   * @returns
   */
  async findOneProductInStore(product_id: number, store_id: number): Promise<StoreProduct> {
    this.storeProductValidator.validateIds({ product_id, store_id }, ['product_id', 'store_id']);

    const product = await this.storeProductRepository.findOne({
      id: product_id,
      store_id: store_id,
    });

    if (!product) {
      throw new NotFoundException('해당 상점에서 상품을 찾을 수 없습니다.');
    }

    return product;
  }

  /**
   * 상점 내 상품 수정
   * @param user
   * @param product_id
   * @param store_id
   * @param updateStoreProductDto
   * @returns
   */
  async updateProductInfoInStore(
    user: User,
    product_id: number,
    store_id: number,
    updateStoreProductDto: UpdateStoreProductDto,
  ): Promise<StoreProductResponse<StoreProduct>> {
    AuthUtils.validateLogin(user);

    this.storeProductValidator.validateIds({ product_id, store_id, user_id: user.id }, [
      'product_id',
      'store_id',
      'user_id',
    ]);

    const product = await this.findOneProductInStore(product_id, store_id);
    await this.storeProductValidator.validateStoreProduct(
      store_id,
      user.id,
      product.local_specialty_id,
    );

    await this.storeProductValidator.validateStoreProduct(store_id, user.id, product_id);

    const { stock, ...updateData } = updateStoreProductDto;

    const updates: Partial<StoreProduct> = {
      ...updateData,
      ...(stock !== undefined && {
        stock,
        sold_out: stock <= 0,
      }),
    };

    await this.storeProductRepository.update(product_id, updates);

    const updatedProduct = await this.findOneProductInStore(product_id, store_id);

    return {
      message: `${updatedProduct.product_name} 상품이 수정되었습니다.`,
      data: updatedProduct,
    };
  }

  /**
   * 상점 내 상품 삭제
   * @param product_id
   * @param store_id
   * @param user
   * @returns
   */
  async deleteStoreProductInStore(
    product_id: number,
    store_id: number,
    user: User,
  ): Promise<StoreProductResponse<StoreProduct>> {
    AuthUtils.validateLogin(user);

    await this.storeProductValidator.validateStoreProduct(store_id, user.id, product_id);

    const product = await this.findOneProductInStore(product_id, store_id);

    await this.storeProductRepository.delete(product);

    return { message: `${product.product_name} 상품 삭제 완료`, data: product };
  }
}
