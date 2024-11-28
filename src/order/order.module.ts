import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CartItemModule } from 'src/cart-item/cart-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, StoreProduct]),
    ScheduleModule.forRoot(),
    forwardRef(() => CartItemModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
