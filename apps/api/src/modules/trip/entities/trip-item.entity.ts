import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TripDay } from './trip-day.entity';
import { Poi } from '../../poi/entities/poi.entity';

/**
 * TripItem 分类 —— 架构文档 1.2.0 已确认新增字段，与 Expense.category 是独立枚举，不复用。
 */
export type TripItemCategory = '景点' | '餐厅' | '交通' | '其他';

/**
 * TripItem — 一天中的单点安排（景点/餐厅等）。
 * - start_time / duration_minutes 均可为空（1.2.0 已确认："时间可以先不填"）
 * - sort_order 是拖拽排序的唯一依据，和 start_time 互不校验（1.2.0 已确认）
 */
@Entity('trip_items')
export class TripItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_day_id' })
  tripDayId!: string;

  @ManyToOne(() => TripDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_day_id' })
  tripDay!: TripDay;

  @Column({ name: 'poi_id', nullable: true })
  poiId?: string;

  @ManyToOne(() => Poi, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'poi_id' })
  poi?: Poi;

  @Column({ type: 'varchar' })
  category!: TripItemCategory;

  @Column()
  title!: string;

  /** HH:mm，允许为空，未填时前端归入"待安排"分组 */
  @Column({ name: 'start_time', nullable: true })
  startTime?: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'text', nullable: true })
  note?: string;
}
