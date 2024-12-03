import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { Repository } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';
import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { AuthUtils } from 'src/common/utils/auth.utils';

@Injectable()
export class StoreProductService {
  constructor(
    @InjectRepository(StoreProduct)
    private readonly storeProductRepository: Repository<StoreProduct>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(LocalSpecialty)
    private readonly localSpecialtyRepository: Repository<LocalSpecialty>,
  ) {}

  /**
   * 상점 소유자 검증
   * @param store_id
   * @param user
   * @returns
   */
  private async validateStoreOwner(store_id: number, user: User) {
    AuthUtils.validateLogin(user);

    const store = await this.storeRepository.findOne({
      where: { id: store_id, user_id: user.id, deleted_at: null },
    });
    if (!store) {
      throw new ForbiddenException('상점에 대한 권한 X');
    }

    return store;
  }

  /**
   * 상점 내 상품 등록
   * @param user
   * @param store_id
   * @param createStoreProductDto
   * @returns
   */
  async create(user: User, store_id: number, createStoreProductDto: CreateStoreProductDto) {
    AuthUtils.validateLogin(user);

    await this.validateStoreOwner(store_id, user);

    const { local_specialty_id, stock } = createStoreProductDto;
    const localSpecialty = await this.localSpecialtyRepository.findOne({
      where: { id: local_specialty_id },
    });
    if (!localSpecialty) {
      throw new NotFoundException('지역 특산품 존재 X');
    }

    const newStoreProduct = this.storeProductRepository.save({
      ...createStoreProductDto,
      store_id,
      sold_out: stock > 0 ? false : true,
    });

    return newStoreProduct;
  }

  /**
   * 상점 내 상품들 조회
   * @param store_id
   * @returns
   */
  async findAll(store_id: number) {
    return await this.storeProductRepository.find({
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

  /**
   * 상점 내 상품 하나 상세 조회
   * @param product_id
   * @param store_id
   * @returns
   */
  async findOne(product_id: number, store_id: number) {
    const product = await this.storeProductRepository.findOne({
      where: { id: product_id, store_id },
      relations: ['local_specialty'],
    });

    if (!product) {
      throw new NotFoundException('상점 내 상품 존재 X');
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
  async update(
    user: User,
    product_id: number,
    store_id: number,
    updateStoreProductDto: UpdateStoreProductDto,
  ) {
    AuthUtils.validateLogin(user);

    await this.validateStoreOwner(store_id, user);

    const { stock } = updateStoreProductDto;

    const product = await this.storeProductRepository.findOne({
      where: { id: product_id, store_id },
    });

    if (!product) {
      throw new NotFoundException('상품 존재 X');
    }

    await this.storeProductRepository.update(
      { id: product_id },
      {
        ...updateStoreProductDto,
        sold_out: stock !== undefined ? (stock > 0 ? false : true) : product.sold_out,
      },
    );

    return { message: '상품 수정 완료', product_name: product.product_name };
  }

  /**
   * 상점 내 상품 삭제
   * @param product_id
   * @param store_id
   * @param user
   * @returns
   */
  async delete(product_id: number, store_id: number, user: User) {
    AuthUtils.validateLogin(user);

    await this.validateStoreOwner(store_id, user);

    const product = await this.storeProductRepository.findOne({
      where: { id: product_id, store_id },
    });

    if (!product) {
      throw new NotFoundException('상품 존재 X');
    }

    await this.storeProductRepository.remove(product);

    return { message: '상품 삭제 완료' };
  }
}
