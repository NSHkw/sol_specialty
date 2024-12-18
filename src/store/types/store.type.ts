export type StoreServiceResponse<T = void> = {
  message: string;
  data?: T;
};

export type LocalSpecialtyInfo = {
  id: number;
  name: string;
  price: number;
};

export type ReviewStats = {
  average_rating: number;
  total_reviews?: number;
};

export type StoreBaseInfo = {
  id: number;
  name: string;
  local_specialties: LocalSpecialtyInfo[];
  review_stats: ReviewStats;
};

export type StoreDetailInfo = StoreBaseInfo & {
  description: string;
  address?: string;
  phone_number: string;
  image?: string;
  location: [number, number];
};

export type SearchResult = {
  stores: StoreBaseInfo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
