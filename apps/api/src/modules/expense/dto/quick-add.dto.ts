import { IsString } from 'class-validator';

export class QuickAddDraftDto {
  /** 用户在常驻输入框里打的原始文字，例如"老王 打车 43" */
  @IsString()
  text!: string;
}
