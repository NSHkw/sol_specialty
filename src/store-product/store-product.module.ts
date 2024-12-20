import { forwardRef, Module } from '@nestjs/common';
import { StoreProductService } from './store-product.service';
import { StoreProductController } from './store-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { StoreModule } from '../store/store.module';
import { CartItemModule } from '../cart-item/cart-item.module';
import { LocalSpecialty } from '../local-specialty/entities/local-specialty.entity';
import { Store } from '../store/entities/store.entity';
import { AuthModule } from '../auth/auth.module';
import { StoreProductValidator } from './store-product.validator';
import { StoreProductRepository } from './store-product.repository';
import { LocalSpecialtyModule } from '../local-specialty/local-specialty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProduct, Store, LocalSpecialty]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreModule),
    forwardRef(() => CartItemModule),
    forwardRef(() => LocalSpecialtyModule),
  ],
  controllers: [StoreProductController],
  providers: [
    StoreProductService,
    StoreProductValidator,
    {
      provide: StoreProductRepository,
      useClass: StoreProductRepository,
    },
  ],
  exports: [StoreProductService, StoreProductRepository],
})
export class StoreProductModule {}
