import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateCashDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
