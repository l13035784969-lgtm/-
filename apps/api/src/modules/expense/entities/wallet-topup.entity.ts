import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletPool } from './wallet-pool.entity';
import { TripMember } from '../../trip/entities/trip-member.entity';

/** WalletTopUp — 虚拟预充值记录，仅记账数字，不代表真实收款（架构文档 4 节）。 */
@Entity('wallet_topups')
export class WalletTopUp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'wallet_pool_id' })
  walletPoolId!: string;

  @ManyToOne(() => WalletPool, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_pool_id' })
  walletPool!: WalletPool;

  @Column({ name: 'member_id' })
  memberId!: string;

  @ManyToOne(() => TripMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member!: TripMember;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
