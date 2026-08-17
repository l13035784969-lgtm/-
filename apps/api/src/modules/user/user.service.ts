import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  /**
   * 微信小程序登录：拿 wx.login 换来的 openid 找用户，没有就建一个。
   * 免用户自建密码体系（架构文档 2.3 节）。
   */
  async findOrCreateByOpenid(openid: string, unionid?: string): Promise<User> {
    let user = await this.users.findOne({ where: { openid } });
    if (!user) {
      user = this.users.create({ openid, unionid, nickname: '' });
      user = await this.users.save(user);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }
}
