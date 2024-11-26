import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { AuthModule } from 'src/auth/auth.module';
import { StoreProductModule } from 'src/store-product/store-product.module';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), AuthModule, forwardRef(() => StoreProductModule)],
  controllers: [CartItemController],
  providers: [CartItemService],
})
export class CartItemModule {}
