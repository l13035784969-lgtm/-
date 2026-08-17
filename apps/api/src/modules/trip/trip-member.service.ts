import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { TripMember } from './entities/trip-member.entity';

@Injectable()
export class TripMemberService {
  constructor(
    @InjectRepository(TripMember)
    private readonly members: Repository<TripMember>,
  ) {}

  /**
   * 添加占位成员（架构文档 1.2.2 e 已确认）：只给个名字，生成一条带 claim_token 的记录，
   * 前端拿这个 token 生成"认领"小程序码/转发卡片。不采集手机号。
   */
  async addPlaceholderMember(tripId: string, displayName: string): Promise<TripMember> {
    const member = this.members.create({
      tripId,
      displayName,
      claimToken: randomUUID(),
    });
    return this.members.save(member);
  }

  /**
   * 认领占位成员身份：本人登录后点击认领链接，把 user_id 写进这条记录，
   * claim_token 失效，之前记在这个名字下的账自动变成他自己的。
   */
  async claim(claimToken: string, userId: string, nickname?: string): Promise<TripMember> {
    const member = await this.members.findOne({ where: { claimToken } });
    if (!member) throw new NotFoundException('认领链接无效或已被使用');

    const alreadyJoined = await this.members.findOne({
      where: { tripId: member.tripId, userId },
    });
    if (alreadyJoined) {
      throw new BadRequestException('你已经在这个行程里了');
    }

    member.userId = userId;
    if (nickname) member.displayName = nickname;
    member.claimToken = undefined;
    return this.members.save(member);
  }

  async listByTrip(tripId: string): Promise<TripMember[]> {
    return this.members.find({ where: { tripId } });
  }
}
