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

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProduct, Store, LocalSpecialty]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreModule),
    forwardRef(() => CartItemModule),
  ],
  controllers: [StoreProductController],
  providers: [StoreProductService],
})
export class StoreProductModule {}
