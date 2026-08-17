import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trip } from '../../trip/entities/trip.entity';
import { TripMember } from '../../trip/entities/trip-member.entity';
import { ExpenseSplit } from './expense-split.entity';

export type ExpenseCategory = '餐饮' | '交通' | '门票' | '住宿' | '其他';
export type ExpenseSource = 'personal' | 'pool';
export type SplitType = '均摊' | '自定义金额' | '按比例';
export type InputMethod = '表单' | '文字快速记账';

/**
 * Expense — 费用记录（架构文档 4 节 / 1.2.2 已确认的一系列规则）：
 * - 仅支持人民币，不做多币种/汇率
 * - 任意 TripMember 可编辑/删除任意一条（熟人小团体，效率优先），
 *   只记 updated_by/updated_at 留痕，不做完整版本历史、不做角色分级
 * - source=pool 时 payer_id 为空（钱袋自己扣，不是某个人垫付）
 */
@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ name: 'payer_id', nullable: true })
  payerId?: string;

  @ManyToOne(() => TripMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payer_id' })
  payer?: TripMember;

  @Column()
  title!: string;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @Column({ type: 'varchar' })
  category!: ExpenseCategory;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate!: string;

  @Column({ type: 'varchar', default: 'personal' })
  source!: ExpenseSource;

  @Column({ name: 'split_type', type: 'varchar', default: '均摊' })
  splitType!: SplitType;

  @Column({ name: 'input_method', type: 'varchar', default: '表单' })
  inputMethod!: InputMethod;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt?: Date;

  @OneToMany(() => ExpenseSplit, (s) => s.expense, { cascade: true })
  splits?: ExpenseSplit[];
}
