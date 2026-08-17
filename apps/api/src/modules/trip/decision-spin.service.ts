import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecisionSpin } from './entities/decision-spin.entity';
import { TripMember } from './entities/trip-member.entity';
import { pickRandomParticipant } from './decision-spin.algorithm';

@Injectable()
export class DecisionSpinService {
  constructor(
    @InjectRepository(DecisionSpin) private readonly spins: Repository<DecisionSpin>,
    @InjectRepository(TripMember) private readonly members: Repository<TripMember>,
  ) {}

  /**
   * 发起一轮命运轮盘（架构文档 1.2.3 已确认）：
   * - 参与人默认全员，可传 participantIds 自定义排除部分人
   * - 结果由后端随机生成并落库，前端只负责把这个已确定的结果用转盘动画呈现出来
   * - 生成后即锁定：这个函数不提供"重抽"能力，要重来只能 void() 之后再 spin() 开新一轮
   */
  async spin(
    tripId: string,
    topic: string,
    createdByMemberId: string,
    participantIds?: string[],
  ): Promise<DecisionSpin> {
    const pool = participantIds?.length
      ? participantIds
      : (await this.members.find({ where: { tripId } })).map((m) => m.id);

    if (pool.length === 0) {
      throw new BadRequestException('至少需要一名参与人才能开始');
    }

    const selectedMemberId = pickRandomParticipant(pool);

    const spin = this.spins.create({
      tripId,
      topic,
      participantIds: pool,
      selectedMemberId,
      status: 'active',
      createdBy: createdByMemberId,
    });
    return this.spins.save(spin);
  }

  /** 作废当前这一轮，之后可以再 spin() 开新的一轮。只有发起人能作废。 */
  async void(spinId: string, requestedByMemberId: string): Promise<DecisionSpin> {
    const spin = await this.spins.findOne({ where: { id: spinId } });
    if (!spin) throw new NotFoundException('这一轮命运轮盘不存在');
    if (spin.createdBy !== requestedByMemberId) {
      throw new ForbiddenException('只有发起人能作废这一轮');
    }
    spin.status = 'voided';
    return this.spins.save(spin);
  }

  async listByTrip(tripId: string): Promise<DecisionSpin[]> {
    return this.spins.find({ where: { tripId }, order: { createdAt: 'DESC' } });
  }
}
