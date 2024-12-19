import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../store/entities/store.entity';
import { UserModule } from '../user/user.module';
import { StoreModule } from '../store/store.module';
import { AuthModule } from '../auth/auth.module';
import { ReviewRepository } from './review.repository';
import { ReviewValidator } from './review.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Store]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => StoreModule),
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewValidator,
    {
      provide: ReviewRepository,
      useClass: ReviewRepository,
    },
  ],
  exports: [ReviewService, TypeOrmModule, ReviewRepository, ReviewValidator],
})
export class ReviewModule {}
