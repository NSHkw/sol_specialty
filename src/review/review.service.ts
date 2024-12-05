import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { AuthUtils } from 'src/common/utils/auth.utils';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  // 리뷰 평균 점수 업데이트
  private async updateStoreRating(store_id: number) {
    const reviews = await this.reviewRepository.find({
      where: {
        store_id,
        deleted_at: null,
      },
      select: {
        rating: true,
      },
    });

    // 리뷰가 없는 경우 0으로 설정
    if (!reviews || reviews.length === 0) {
      await this.storeRepository.update(store_id, {
        rating: 0,
        review_count: 0,
      });
      return;
    }

    // decimal 타입의 rating을 명시적으로 number로 변환
    const totalRating = reviews.reduce((sum, review) => {
      return sum + Number(review.rating);
    }, 0);

    // 소수점 한 자리까지 계산하고 문자열이 아닌 숫자로 변환
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await this.storeRepository.update(store_id, {
      rating: averageRating,
      review_count: reviews.length,
    });
  }

  async create(user: User, createReviewDto: CreateReviewDto) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const { store_id, rating, content } = createReviewDto;

    // 상점 존재 예외처리와 리뷰 존재 예외처리를 Promise.all로 병렬 처리 가능
    const [existingStore, existingReview] = await Promise.all([
      this.storeRepository.findOne({
        where: { id: store_id, deleted_at: null },
      }),
      this.reviewRepository.findOne({
        where: { user_id: user.id, store_id, deleted_at: null },
      }),
    ]);

    if (!existingStore) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    if (existingReview) {
      throw new ConflictException('이미 상점에 대한 리뷰를 적었다');
    }

    const review = await this.reviewRepository.save({
      user_id: user.id,
      store_id,
      rating,
      content,
    });

    await this.updateStoreRating(store_id);

    return { message: '리뷰가 등록되었다', review };
  }

  async delete(user: User, store_id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    // 상점 존재 예외처리
    const store = await this.storeRepository.findOne({
      where: { id: store_id, deleted_at: null },
    });

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    // 리뷰 존재 예외처리
    const existingReview = await this.reviewRepository.findOne({
      where: { user_id: user.id, store_id, deleted_at: null },
    });
    if (!existingReview) {
      throw new NotFoundException('이 상점에 대해 리뷰 안적음');
    }

    // 리뷰 소유자 체크
    AuthUtils.validateResourceOwner(existingReview.user_id, user);

    await this.reviewRepository.softDelete(existingReview.id);

    await this.updateStoreRating(store_id);

    return {
      message: '리뷰가 삭제되었다',
      삭제한_리뷰: {
        store_id,
        content: existingReview.content,
        rating: existingReview.rating,
      },
    };
  }

  async getReviews(store_id: number) {
    const store = await this.storeRepository.findOne({
      where: { id: store_id, deleted_at: null },
    });

    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    const reviews = await this.reviewRepository.find({
      where: { store_id, deleted_at: null },
      relations: ['user'],
      select: {
        id: true,
        content: true,
        rating: true,
        user: { id: true, nickname: true },
      },
    });

    return {
      상점_이름: store.name,
      총_리뷰_개수: reviews.length,
      평균_리뷰_점수: store.rating,
      reviews,
    };
  }

  async updateReview(user: User, store_id: number, updateReviewDto: UpdateReviewDto) {
    AuthUtils.validateLogin(user);

    // 상점 존재 예외처리
    const store = await this.storeRepository.findOne({
      where: { id: store_id, deleted_at: null },
    });
    if (!store) {
      throw new NotFoundException('존재하지 않는 상점');
    }

    // 리뷰 존재 예외처리
    const existingReview = await this.reviewRepository.findOne({
      where: { user_id: user.id, store_id, deleted_at: null },
    });
    if (!existingReview) {
      throw new NotFoundException('이 상점에 대해 리뷰 안 적음');
    }

    AuthUtils.validateResourceOwner(existingReview.user_id, user);

    await this.reviewRepository.update(existingReview.id, {
      content: updateReviewDto.content,
      rating: updateReviewDto.rating,
    });

    await this.updateStoreRating(store_id);

    return {
      message: '리뷰 수정',
      수정한_리뷰: {
        store_id,
        content: updateReviewDto.content,
        rating: updateReviewDto.rating,
      },
    };
  }
}
