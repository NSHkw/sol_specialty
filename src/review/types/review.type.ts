// src/review/types/review.type.ts
export type ReviewResponse<T = void> = {
  message: string;
  data?: T;
};
