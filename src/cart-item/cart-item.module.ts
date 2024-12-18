import { forwardRef, Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { UserModule } from '../user/user.module';
import { StoreProductModule } from '../store-product/store-product.module';
import { AuthModule } from '../auth/auth.module';
import { StoreProduct } from '../store-product/entities/store-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, StoreProduct]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => StoreProductModule),
  ],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule {}
