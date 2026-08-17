import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trip } from './trip.entity';
import { Poi } from '../../poi/entities/poi.entity';

/**
 * Accommodation — 住宿，挂在 Trip 上而非某一天，跨天区间（架构文档 1.2.1 已确认）。
 * 展现层负责把 check_in_date~check_out_date 覆盖的每一天渲染成条幅，
 * 连续多天同一酒店合并显示，不在这里重复建行。
 */
@Entity('accommodations')
export class Accommodation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'trip_id' })
  tripId!: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ name: 'poi_id', nullable: true })
  poiId?: string;

  @ManyToOne(() => Poi, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'poi_id' })
  poi?: Poi;

  @Column()
  name!: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate!: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
