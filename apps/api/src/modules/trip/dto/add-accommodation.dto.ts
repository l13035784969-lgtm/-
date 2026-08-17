import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AddAccommodationDto {
  @IsOptional()
  @IsString()
  poiId?: string;

  @IsString()
  name!: string;

  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
