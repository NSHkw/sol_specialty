import { Injectable } from '@nestjs/common';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';

@Injectable()
export class StoreProductService {
  create(createStoreProductDto: CreateStoreProductDto) {
    return 'This action adds a new storeProduct';
  }

  findAll() {
    return `This action returns all storeProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storeProduct`;
  }

  update(id: number, updateStoreProductDto: UpdateStoreProductDto) {
    return `This action updates a #${id} storeProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} storeProduct`;
  }
}
