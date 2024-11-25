import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Store } from 'src/store/entities/store.entity';
import { UserModule } from 'src/user/user.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Store]),
    JwtModule,
    UserModule,
    forwardRef(() => StoreModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService, TypeOrmModule],
})
export class ReviewModule {}
