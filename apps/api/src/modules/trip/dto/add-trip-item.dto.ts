import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TripItemCategory } from '../entities/trip-item.entity';

const CATEGORIES: TripItemCategory[] = ['景点', '餐厅', '交通', '其他'];

export class AddTripItemDto {
  @IsString()
  tripDayId!: string;

  @IsOptional()
  @IsString()
  poiId?: string;

  @IsIn(CATEGORIES)
  category!: TripItemCategory;

  @IsString()
  title!: string;

  /** 可以不填，之后再补（1.2.0 已确认） */
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
