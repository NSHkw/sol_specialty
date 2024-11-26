import { forwardRef, Module } from '@nestjs/common';
import { StoreProductService } from './store-product.service';
import { StoreProductController } from './store-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreProduct } from './entities/store-product.entity';
import { StoreModule } from 'src/store/store.module';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { Store } from 'src/store/entities/store.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProduct, Store, LocalSpecialty]),
    AuthModule,
    forwardRef(() => StoreModule),
    forwardRef(() => CartItemModule),
  ],
  controllers: [StoreProductController],
  providers: [StoreProductService],
})
export class StoreProductModule {}
