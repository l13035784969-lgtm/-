import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { TripMemberService } from './trip-member.service';

// 踩坑记录：这个类一开始没加 class-validator 装饰器，main.ts 里全局 ValidationPipe
// 开了 whitelist:true（过滤掉没有校验装饰器的字段），结果 displayName 被整个丢弃，
// 数据库 NOT NULL 约束报错。DTO 只要被 whitelist 模式的 ValidationPipe 处理，
// 每个字段都必须至少有一个 class-validator 装饰器，不然会被静默剔除。
class AddMemberDto {
  @IsString()
  displayName!: string;
}

@Controller()
export class TripMemberController {
  constructor(private readonly memberService: TripMemberService) {}

  @Get('trips/:id/members')
  list(@Param('id') tripId: string) {
    return this.memberService.listByTrip(tripId);
  }

  @Post('trips/:id/members')
  add(@Param('id') tripId: string, @Body() dto: AddMemberDto) {
    return this.memberService.addPlaceholderMember(tripId, dto.displayName);
  }

  @Post('members/claim/:token')
  claim(@Param('token') token: string, @Headers('x-user-id') userId: string) {
    return this.memberService.claim(token, userId);
  }
}
