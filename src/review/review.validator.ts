// src/review/review.validator.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { StoreRepository } from '../store/store.repository';
import { Store } from '../store/entities/store.entity';
import { Review } from './entities/review.entity';
import { AuthUtils } from '../common/utils/auth.utils';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReviewValidator {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly storeRepository: StoreRepository,
  ) {}

  async validateStore(store_id: number): Promise<void> {
    const store = await this.storeRepository.findOneById(store_id);

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }
  }

  async validateReviewOwner(user_id: number, store_id: number): Promise<Review> {
    const review = await this.reviewRepository.findByUserAndStore(user_id, store_id);

    if (!review) {
      throw new NotFoundException('해당 상점의 리뷰가 없음');
    }

    AuthUtils.validateResourceOwner(review.user_id, { id: user_id } as User);

    return review;
  }

  async validateNewReview(user_id: number, store_id: number): Promise<void> {
    const existingReview = await this.reviewRepository.findByUserAndStore(user_id, store_id);

    if (existingReview) {
      throw new ConflictException('이미 이 상점 리뷰 존재');
    }
  }
}
