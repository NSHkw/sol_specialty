import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MapModule } from './map.module';
import { AuthModule } from './auth/auth.module';
import { LocalSpecialtyModule } from './local-specialty/local-specialty.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { StoreModule } from './store/store.module';
import { StoreProductModule } from './store-product/store-product.module';
import { UserModule } from './user/user.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationJoiSchema } from './configs/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormModuleOptions } from './configs/database.config';

@Module({
  imports: [
    AuthModule,
    LocalSpecialtyModule,
    OrderModule,
    ReviewModule,
    StoreModule,
    StoreProductModule,
    UserModule,
    CartItemModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationJoiSchema,
    }),
    TypeOrmModule.forRootAsync(typeormModuleOptions),
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
