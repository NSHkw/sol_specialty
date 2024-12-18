import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ReviewResponse } from './types/review.type';
import { Review } from './entities/review.entity';

@ApiTags('Review')
@ApiBearerAuth('access-token')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // 로그인 한 유저가 상점에 대한 리뷰 작성
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @GetUser() user: User,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>> {
    return this.reviewService.createReview(user, createReviewDto);
  }

  // 로그인 한 유저가 상점에 대한 리뷰 제거
  @Delete(':store_id')
  @UseGuards(JwtAuthGuard)
  delete(@GetUser() user: User, @Param('store_id') store_id: number): Promise<ReviewResponse> {
    return this.reviewService.deleteReview(user, store_id);
  }

  // 특정 id 상점의 리뷰 조회
  @Get(':store_id')
  getReviews(@Param('store_id') store_id: number): Promise<Review[]> {
    return this.reviewService.getAllReviewsOfStore(store_id);
  }

  // 로그인 한 유저가 상점에 대해 작성한 리뷰 수정
  @Patch(':store_id')
  @UseGuards(JwtAuthGuard)
  update(
    @GetUser() user: User,
    @Param('store_id') store_id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponse<Partial<Review>>> {
    return this.reviewService.updateReview(user, store_id, updateReviewDto);
  }
}
