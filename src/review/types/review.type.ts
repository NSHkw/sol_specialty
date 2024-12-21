// src/review/types/review.type.ts
export type ReviewResponse<T = void> = {
  message: string;
  data?: T;
};

export type ReviewDetailResponse = {
  store_name: string;
  review_count: number;
  avg_rating: number;
  reviews: {
    user: {
      nickname: string;
    };
    rating: number;
    content: string;
  }[];
};
