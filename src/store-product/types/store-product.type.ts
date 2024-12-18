// src/store-product/types/store-product.type.ts
export type StoreProductResponse<T = void> = {
  message: string;
  data?: T;
};
