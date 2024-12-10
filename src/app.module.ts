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
import { ReviewModule } from './review/review.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationJoiSchema } from './configs/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormModuleOptions } from './configs/database.config';
import { ScheduleModule } from '@nestjs/schedule';
import { MapModule } from './map.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    UserModule,
    AuthModule,
    StoreModule,
    StoreProductModule,
    LocalSpecialtyModule,
    CartItemModule,
    OrderModule,
    ReviewModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationJoiSchema,
    }),
    TypeOrmModule.forRootAsync(typeormModuleOptions),
    ScheduleModule.forRoot(),
    MapModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
        extensions: ['html', 'js', 'svg'],
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
