import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../../user/entities/user.entity';

/**
 * TripMember — 行程成员，用于加入行程 + 参与费用分摊/命运轮盘抽签（架构文档 1.2 节）。
 * - 创建 Trip 时自动为 owner 插入一条（user_id 直接指向创建者，不需要认领）
 * - 占位成员（人还没加入小程序）display_name 自定义、user_id 为空、带 claim_token；
 *   本人通过认领链接登录后把 user_id 填进来，claim_token 置空（1.2.2 e 已确认）
 */
@Entity('trip_members')
export class TripMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'display_name' })
  displayName!: string;

  @Index({ unique: true, where: '"claim_token" IS NOT NULL' })
  @Column({ name: 'claim_token', nullable: true })
  claimToken?: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;
}
