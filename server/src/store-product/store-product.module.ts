import { Module } from '@nestjs/common';
import { StoreProductService } from './store-product.service';
import { StoreProductController } from './store-product.controller';

@Module({
  controllers: [StoreProductController],
  providers: [StoreProductService],
})
export class StoreProductModule {}
