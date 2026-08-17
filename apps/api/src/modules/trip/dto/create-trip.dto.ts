import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTripDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  destination?: string;
}
