import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsNotEmpty()
  content?: string;
}
