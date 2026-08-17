import { IsInt, IsString, Min } from 'class-validator';

export class TopUpDto {
  @IsString()
  memberId!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;
}
