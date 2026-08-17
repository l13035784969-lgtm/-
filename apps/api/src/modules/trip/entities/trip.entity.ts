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
import { User } from '../../user/entities/user.entity';
import { TripDay } from './trip-day.entity';
import { TripMember } from './trip-member.entity';
import { Accommodation } from './accommodation.entity';

export type TripStatus = 'draft' | 'published';

/**
 * Trip — 架构文档 4 节。
 * 创建行程时（TripService.createTrip）在同一事务里：
 *   1) 按 start_date~end_date 生成 TripDay
 *   2) 自动把创建者插入一条 TripMember（1.2 节已确认）
 */
@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'owner_id' })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column()
  title!: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage?: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ nullable: true })
  destination?: string;

  @Column({ type: 'varchar', default: 'draft' })
  status!: TripStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TripDay, (d) => d.trip)
  days?: TripDay[];

  @OneToMany(() => TripMember, (m) => m.trip)
  members?: TripMember[];

  @OneToMany(() => Accommodation, (a) => a.trip)
  accommodations?: Accommodation[];
}
