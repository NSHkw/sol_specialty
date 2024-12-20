import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../user/entities/user.entity';
import { Review } from './entities/review.entity';
import { AuthUtils } from '../common/utils/auth.utils';
import { ReviewInterface } from './interfaces/review.interface';
import { ReviewDetailResponse, ReviewResponse } from './types/review.type';
import { ReviewRepository } from './review.repository';
import { StoreRepository } from '../store/store.repository';
import { ReviewValidator } from './review.validator';

@Injectable()
export class ReviewService implements ReviewInterface {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly storeRepository: StoreRepository,
    private readonly reviewValidator: ReviewValidator,
  ) {}

  async createReview(
    user: User,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>> {
    AuthUtils.validateLogin(user);

    const { store_id, rating, content } = createReviewDto;

    await this.reviewValidator.validateStore(store_id);
    await this.reviewValidator.validateNewReview(user.id, store_id);

    const review = await this.reviewRepository.create({
      user_id: user.id,
      store_id,
      rating,
      content,
    });

    const { rating: averageRating, count } =
      await this.reviewRepository.getStoreReviewStats(store_id);
    await this.storeRepository.updateReviewStats(store_id, averageRating, count);

    return { message: '리뷰가 등록되었다', data: review };
  }

  async deleteReview(user: User, store_id: number): Promise<ReviewResponse> {
    AuthUtils.validateLogin(user);

    await this.reviewValidator.validateStore(store_id);
    const review = await this.reviewValidator.validateReviewOwner(user.id, store_id);

    await this.reviewRepository.softDelete(review.id);

    const { rating: averageRating, count } =
      await this.reviewRepository.getStoreReviewStats(store_id);
    await this.storeRepository.updateReviewStats(store_id, averageRating, count);

    return {
      message: '리뷰 삭제',
    };
  }

  async getAllReviewsOfStore(store_id: number): Promise<ReviewDetailResponse> {
    await this.reviewValidator.validateStore(store_id);

    const [reviews, stats] = await Promise.all([
      this.reviewRepository.findAllByStoreId(store_id),
      this.reviewRepository.getStoreReviewStats(store_id),
    ]);

    return {
      store_name: reviews[0]?.store.name || '알 수 없는 상점',
      review_count: stats.count,
      avg_rating: stats.rating,
      reviews: reviews.map((review) => ({
        user: {
          nickname: review.user.nickname,
        },
        rating: review.rating,
        content: review.content,
      })),
    };
  }

  async updateReview(
    user: User,
    store_id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>> {
    AuthUtils.validateLogin(user);

    await this.reviewValidator.validateStore(store_id);
    const review = await this.reviewValidator.validateReviewOwner(user.id, store_id);

    await this.reviewRepository.update(review.id, updateReviewDto);

    const { rating: averageRating, count } =
      await this.reviewRepository.getStoreReviewStats(store_id);
    await this.storeRepository.updateReviewStats(store_id, averageRating, count);

    return {
      message: '리뷰 수정',
      data: { ...review, ...updateReviewDto },
    };
  }
}
