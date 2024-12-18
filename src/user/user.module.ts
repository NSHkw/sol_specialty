import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { StoreModule } from '../store/store.module';
import { ReviewModule } from '../review/review.module';
import { OrderModule } from '../order/order.module';
import { CartItemModule } from '../cart-item/cart-item.module';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from './user.repository';
import { UserValidator } from './user.validator';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => StoreModule),
    forwardRef(() => ReviewModule),
    forwardRef(() => OrderModule),
    forwardRef(() => CartItemModule),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION_TIME', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: UserRepository,
    },
    UserValidator,
  ],
  controllers: [UserController],
  exports: [UserService, UserRepository, TypeOrmModule],
})
export class UserModule {}
