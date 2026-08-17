import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory, ExpenseSource, InputMethod, SplitType } from '../entities/expense.entity';

const CATEGORIES: ExpenseCategory[] = ['餐饮', '交通', '门票', '住宿', '其他'];
const SOURCES: ExpenseSource[] = ['personal', 'pool'];
const SPLIT_TYPES: SplitType[] = ['均摊', '自定义金额', '按比例'];
const INPUT_METHODS: InputMethod[] = ['表单', '文字快速记账'];

class SplitInput {
  @IsString()
  memberId!: string;

  /** split_type=自定义金额 时必填（分）；按比例时填权重（如 1、2） */
  @IsInt()
  @Min(0)
  value!: number;
}

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  payerId?: string;

  @IsString()
  title!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsIn(CATEGORIES)
  category!: ExpenseCategory;

  @IsString()
  expenseDate!: string;

  @IsIn(SOURCES)
  source!: ExpenseSource;

  @IsIn(SPLIT_TYPES)
  splitType!: SplitType;

  @IsOptional()
  @IsIn(INPUT_METHODS)
  inputMethod?: InputMethod;

  /**
   * 均摊：只需要 memberId，value 随便填 0；
   * 自定义金额：value = 该成员分摊金额（分）；
   * 按比例：value = 该成员的权重份数。
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitInput)
  splits!: SplitInput[];
}
