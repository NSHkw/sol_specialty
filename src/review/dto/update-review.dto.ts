import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  rating?: number;

  @IsString()
  @IsNotEmpty()
  content?: string;
}
