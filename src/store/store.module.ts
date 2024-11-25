import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    JwtModule,
    UserModule,
    forwardRef(() => ReviewModule),
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService, TypeOrmModule],
})
export class StoreModule {}
