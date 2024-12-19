// src/review/interfaces/review.interface.ts
import { User } from '../../user/entities/user.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewResponse } from '../types/review.type';
import { Review } from '../entities/review.entity';
import { UpdateReviewDto } from '../dto/update-review.dto';

export interface ReviewInterface {
  createReview(
    user: User,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>>;

  deleteReview(user: User, store_id: number): Promise<ReviewResponse>;

  getAllReviewsOfStore(store_id: number): Promise<Review[]>;

  updateReview(
    user: User,
    store_id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>>;
}
