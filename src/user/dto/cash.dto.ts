import { IsNotEmpty, IsNumber } from 'class-validator';

export class CashDto {
  @IsNumber()
  @IsNotEmpty({ message: '캐쉬를 입력해주세요.' })
  cash: number;
}
