import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * User — 对应架构文档 4 节
 * 微信小程序登录体系：openid 全局唯一，unionid 用于跨小程序/公众号统一身份（可选）。
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  openid!: string;

  @Column({ nullable: true })
  unionid?: string;

  @Column({ default: '' })
  nickname!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
