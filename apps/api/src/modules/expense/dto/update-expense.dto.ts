import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseCategory } from '../entities/expense.entity';

const CATEGORIES: ExpenseCategory[] = ['餐饮', '交通', '门票', '住宿', '其他'];

// 踩坑记录：不要用 `Partial<CreateExpenseDto>` 当 @Body() 的类型标注——
// TypeScript 的工具类型（Partial/Pick/...）在编译后没有对应的运行时构造函数，
// Nest 的 ValidationPipe 靠 design:paramtype 元数据拿到的会是 Object，
// 直接跳过校验（既不报错也不生效，等于白名单校验形同虚设）。
// 需要更新哪些字段，就老老实实建一个专门的、真实存在的 DTO class。
export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amountCents?: number;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  expenseDate?: string;
}
