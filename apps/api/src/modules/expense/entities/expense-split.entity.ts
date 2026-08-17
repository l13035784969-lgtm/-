import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './expense.entity';
import { TripMember } from '../../trip/entities/trip-member.entity';

/**
 * ExpenseSplit — 一条 Expense 对应多条，是"谁分摊多少钱"的明细。
 * 离团结算（架构文档 1.2.2 c / 4.1 节已确认）：把某成员的记录标记 excluded=true，
 * 剩余未剔除成员按人数重新分摊该笔的 share_amount_cents。
 */
@Entity('expense_splits')
export class ExpenseSplit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'expense_id' })
  expenseId!: string;

  @ManyToOne(() => Expense, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense!: Expense;

  @Column({ name: 'member_id' })
  memberId!: string;

  @ManyToOne(() => TripMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member!: TripMember;

  @Column({ name: 'share_amount_cents', type: 'int' })
  shareAmountCents!: number;

  @Column({ default: false })
  excluded!: boolean;
}
