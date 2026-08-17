import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Trip } from './trip.entity';
import { TripItem } from './trip-item.entity';

/** TripDay — 架构文档 4 节。创建行程时按日期范围自动生成，一天一条。 */
@Entity('trip_days')
export class TripDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ type: 'date' })
  date!: string;

  /** 第几天，从 1 开始，用于"Day 1/Day 2"展示 */
  @Column({ name: 'day_index' })
  dayIndex!: number;

  @OneToMany(() => TripItem, (i) => i.tripDay)
  items?: TripItem[];
}
