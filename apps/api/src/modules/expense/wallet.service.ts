import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletPool } from './entities/wallet-pool.entity';
import { WalletTopUp } from './entities/wallet-topup.entity';

/**
 * WalletService —— 共享钱袋（架构文档 1.2.2 a 已确认：虚拟记账，不托管真实资金）。
 * 预充值只在这里记一个数字，不产生任何真实资金流转。
 */
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletPool) private readonly pools: Repository<WalletPool>,
    @InjectRepository(WalletTopUp) private readonly topUps: Repository<WalletTopUp>,
  ) {}

  async getOrCreatePool(tripId: string): Promise<WalletPool> {
    let pool = await this.pools.findOne({ where: { tripId } });
    if (!pool) {
      pool = this.pools.create({ tripId, balanceCents: 0 });
      pool = await this.pools.save(pool);
    }
    return pool;
  }

  async topUp(tripId: string, memberId: string, amountCents: number): Promise<WalletTopUp> {
    const pool = await this.getOrCreatePool(tripId);
    const topUp = this.topUps.create({ walletPoolId: pool.id, memberId, amountCents });
    const saved = await this.topUps.save(topUp);

    pool.balanceCents += amountCents;
    await this.pools.save(pool);

    return saved;
  }

  /** 钱袋支出：只影响冗余余额展示，真正的净余额计算走 settlement.ts，不依赖这个字段 */
  async spendFromPool(tripId: string, amountCents: number): Promise<void> {
    const pool = await this.getOrCreatePool(tripId);
    pool.balanceCents -= amountCents;
    await this.pools.save(pool);
  }

  async listTopUps(tripId: string): Promise<WalletTopUp[]> {
    const pool = await this.getOrCreatePool(tripId);
    return this.topUps.find({ where: { walletPoolId: pool.id } });
  }
}
