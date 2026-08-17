import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/** 长按拖拽结束后，前端把这一天的完整顺序一次性提交（架构文档 2.6 已确认：movable-view 拖拽） */
export class ReorderTripItemsDto {
  @IsString()
  tripDayId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderedItemIds!: string[];
}
