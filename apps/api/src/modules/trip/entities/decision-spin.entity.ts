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
import { TripMember } from './trip-member.entity';

export type DecisionSpinStatus = 'active' | 'voided';

/**
 * DecisionSpin — 命运轮盘 · 冤大头模式（架构文档 1.2.3 已确认）。
 * 结果由后端统一生成并落库，不做前端随机；一旦生成即锁定（status=active），
 * 除非发起人主动作废（status=voided）才能重开新一轮。
 */
@Entity('decision_spins')
export class DecisionSpin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column()
  topic!: string;

  /** 本轮参与的 TripMember id 快照，避免后续成员变动影响历史记录 */
  @Column({ name: 'participant_ids', type: 'json' })
  participantIds!: string[];

  @Column({ name: 'selected_member_id' })
  selectedMemberId!: string;

  @ManyToOne(() => TripMember)
  @JoinColumn({ name: 'selected_member_id' })
  selectedMember!: TripMember;

  @Column({ type: 'varchar', default: 'active' })
  status!: DecisionSpinStatus;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
