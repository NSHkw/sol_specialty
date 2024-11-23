import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { StoreProductModule } from './store-product/store-product.module';
import { LocalSpecialtyModule } from './local-specialty/local-specialty.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [UserModule, AuthModule, StoreModule, StoreProductModule, LocalSpecialtyModule, CartItemModule, OrderModule, OrderItemModule, ProductModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
