export type LoginSuccessResponse = {
  access_token: string;
  user_id: number;
};

export type UserResponse<T = void> = {
  message: string;
  data?: T;
};
