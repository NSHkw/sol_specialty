// src/review/review.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    return this.reviewRepository.save(reviewData);
  }

  async update(id: number, reviewData: Partial<Review>): Promise<void> {
    await this.reviewRepository.update(id, reviewData);
  }

  async softDelete(id: number): Promise<void> {
    await this.reviewRepository.softDelete(id);
  }

  async findByUserAndStore(user_id: number, store_id: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { user_id, store_id, deleted_at: null },
    });
  }

  async findAllByStoreId(store_id: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: {
        store_id,
        deleted_at: null,
      },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        user: { id: true, nickname: true },
      },
    });
  }

  async getStoreReviewStats(store_id: number): Promise<{ rating: number; count: number }> {
    const reviews = await this.reviewRepository.find({
      where: { store_id, deleted_at: null },
      select: ['rating'],
    });

    if (!reviews.length) {
      return { rating: 0, count: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    return {
      rating: averageRating,
      count: reviews.length,
    };
  }
}
