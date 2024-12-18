import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entities/user.entity';
import { StoreProduct } from '../store-product/entities/store-product.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CartItemModule } from '../cart-item/cart-item.module';
import { OrderScheduler } from './schedulers/order.scheduler';
// docker 문제 생기면 여기 import 필요

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, StoreProduct]),
    ScheduleModule.forRoot(),
    forwardRef(() => CartItemModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderScheduler],
})
export class OrderModule {}
