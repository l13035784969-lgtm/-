import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from '../../trip/entities/trip.entity';
import { WalletTopUp } from './wallet-topup.entity';

/**
 * WalletPool — 共享钱袋（架构文档 1.2.2 a 已确认）。
 * ⚠️ 纯虚拟记账，不托管真实资金：预充值只是往这里记一个数字，
 * 钱并没有真的转到平台账户。真实资金托管在国内需要支付牌照/资金存管资质，
 * MVP 明确不做，用户实际转账仍靠结算单人工完成。
 * 一个 Trip 最多一个钱袋（trip_id 唯一）。
 */
@Entity('wallet_pools')
export class WalletPool {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  /** = 充值总额 - 池内支出总额，冗余字段方便快速展示，权威计算仍走 settlement.ts */
  @Column({ name: 'balance_cents', type: 'int', default: 0 })
  balanceCents!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => WalletTopUp, (t) => t.walletPool)
  topUps?: WalletTopUp[];
}
