// src/store-product/types/store-product.type.ts
export type StoreProductResponse<T = void> = {
  message: string;
  data?: T;
};

export type StoreProductQuery = {
  id?: number;
  store_id?: number;
};

export type StoreProductSelect = {
  id: boolean;
  product_name: boolean;
  price: boolean;
  grade: boolean;
  type: boolean;
  local_specialty?: {
    id: boolean;
    name: boolean;
  };
};
