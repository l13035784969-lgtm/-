import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type PoiCategory = '景点' | '餐厅' | '酒店' | '交通' | '其他';

/**
 * POI — 兴趣点，缓存小程序端 wx.chooseLocation 选点结果（架构文档 2.1/4 节已确认）。
 * 不对接腾讯位置服务付费 API；wx.chooseLocation 返回结果一般不带稳定第三方 ID，
 * 所以 external_id 允许为空。经纬度用普通 float 列，MVP 不需要 PostGIS 地理索引
 * （地图总览等需要地理计算的功能是二期，届时再评估）。
 */
@Entity('pois')
export class Poi {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'external_id', nullable: true })
  externalId?: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', default: '其他' })
  category!: PoiCategory;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ nullable: true })
  address?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
