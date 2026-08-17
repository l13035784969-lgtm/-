import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { AddTripItemDto } from './dto/add-trip-item.dto';
import { ReorderTripItemsDto } from './dto/reorder-trip-items.dto';
import { AddAccommodationDto } from './dto/add-accommodation.dto';

/**
 * 认证说明：生产环境应该是"小程序 wx.login -> 后端换 openid -> 签发 JWT ->
 * 之后每个请求带 Authorization: Bearer <jwt>"这一套。这个骨架里先用一个
 * X-User-Id 请求头占位，把真实鉴权中间件留到下一轮再补，不阻塞业务逻辑先跑通。
 */
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@Headers('x-user-id') userId: string, @Body() dto: CreateTripDto) {
    return this.tripService.createTrip(userId, dto);
  }

  @Get()
  listMine(@Headers('x-user-id') userId: string) {
    return this.tripService.listMyTrips(userId);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.tripService.getTripDetail(id);
  }

  @Post(':id/items')
  addItem(@Body() dto: AddTripItemDto) {
    return this.tripService.addTripItem(dto);
  }

  @Patch(':id/items/reorder')
  reorder(@Body() dto: ReorderTripItemsDto) {
    return this.tripService.reorderTripItems(dto);
  }

  @Post(':id/accommodations')
  addAccommodation(@Param('id') tripId: string, @Body() dto: AddAccommodationDto) {
    return this.tripService.addAccommodation(tripId, dto);
  }
}
