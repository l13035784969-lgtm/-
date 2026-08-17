import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DecisionSpinService } from './decision-spin.service';
import { SpinDto } from './dto/spin.dto';

@Controller()
export class DecisionSpinController {
  constructor(private readonly spinService: DecisionSpinService) {}

  @Get('trips/:id/spins')
  list(@Param('id') tripId: string) {
    return this.spinService.listByTrip(tripId);
  }

  /** memberId 是发起人自己的 TripMember id（不是 userId），前端在成员列表里已经知道 */
  @Post('trips/:id/spins')
  spin(@Param('id') tripId: string, @Body() dto: SpinDto & { memberId: string }) {
    return this.spinService.spin(tripId, dto.topic, dto.memberId, dto.participantIds);
  }

  @Post('spins/:id/void')
  voidSpin(@Param('id') spinId: string, @Body() body: { memberId: string }) {
    return this.spinService.void(spinId, body.memberId);
  }
}
