import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  private async updateStoreRating(store_id: number) {
    const reviews = await this.reviewRepository.find({
      where: { store_id, deleted_at: null },
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length ? totalRating / reviews.length : 0;

    await this.storeRepository.update(store_id, {
      rating: Number(averageRating.toFixed(1)),
      review_count: reviews.length,
    });
  }

  async create(user: User, createReviewDto: CreateReviewDto) {
    const { store_id, rating, content } = createReviewDto;

    const existingStore = await this.storeRepository.findOne({
      where: { id: store_id, deleted_at: null },
    });

    if (!existingStore) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { user_id: user.id, store_id, deleted_at: null },
    });

    if (!existingReview) {
      throw new ConflictException('이미 상점에 대한 리뷰를 적었다');
    }

    const review = this.reviewRepository.save({
      user_id: user.id,
      store_id,
      rating,
      content,
    });

    await this.updateStoreRating(store_id);

    return { message: '리뷰가 등록되었다', review };
  }
}
