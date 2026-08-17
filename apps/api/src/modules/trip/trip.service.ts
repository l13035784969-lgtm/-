import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { TripDay } from './entities/trip-day.entity';
import { TripItem } from './entities/trip-item.entity';
import { Accommodation } from './entities/accommodation.entity';
import { TripMember } from './entities/trip-member.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { AddTripItemDto } from './dto/add-trip-item.dto';
import { ReorderTripItemsDto } from './dto/reorder-trip-items.dto';
import { AddAccommodationDto } from './dto/add-accommodation.dto';
import { enumerateDates, formatDefaultTitle } from './trip.utils';

@Injectable()
export class TripService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Trip) private readonly trips: Repository<Trip>,
    @InjectRepository(TripDay) private readonly tripDays: Repository<TripDay>,
    @InjectRepository(TripItem) private readonly tripItems: Repository<TripItem>,
    @InjectRepository(Accommodation)
    private readonly accommodations: Repository<Accommodation>,
    @InjectRepository(TripMember) private readonly tripMembers: Repository<TripMember>,
  ) {}

  /**
   * 创建行程 —— 架构文档 1.2 第1项已确认：
   *   1) 生成 Trip
   *   2) 按日期范围生成 TripDay（day_index 从 1 开始）
   *   3) 创建者自动加入为第一个 TripMember（否则没法记账/参与命运轮盘）
   * 三件事在同一事务里做，任何一步失败都整体回滚。
   */
  async createTrip(ownerId: string, dto: CreateTripDto): Promise<Trip> {
    const dates = enumerateDates(dto.startDate, dto.endDate);

    return this.dataSource.transaction(async (manager) => {
      const trip = manager.create(Trip, {
        ownerId,
        title: dto.title?.trim() || formatDefaultTitle(dto.destination, dto.startDate),
        coverImage: dto.coverImage,
        startDate: dto.startDate,
        endDate: dto.endDate,
        destination: dto.destination,
        status: 'draft',
      });
      const savedTrip = await manager.save(trip);

      const days = dates.map((date, index) =>
        manager.create(TripDay, {
          tripId: savedTrip.id,
          date,
          dayIndex: index + 1,
        }),
      );
      await manager.save(days);

      const ownerMember = manager.create(TripMember, {
        tripId: savedTrip.id,
        userId: ownerId,
        displayName: '我', // 前端展示时替换成 User.nickname
      });
      await manager.save(ownerMember);

      return savedTrip;
    });
  }

  async getTripOrThrow(tripId: string): Promise<Trip> {
    const trip = await this.trips.findOne({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('行程不存在');
    return trip;
  }

  /** "我的行程"列表——自己创建的 + 被拉入（TripMember.userId 命中）的，去重按创建时间倒序 */
  async listMyTrips(userId: string): Promise<Trip[]> {
    return this.trips
      .createQueryBuilder('trip')
      .leftJoin('trip_members', 'member', 'member.trip_id = trip.id')
      .where('trip.owner_id = :userId', { userId })
      .orWhere('member.user_id = :userId', { userId })
      .distinct(true)
      .orderBy('trip.created_at', 'DESC')
      .getMany();
  }

  /** 行程详情聚合 —— BFF 层一次性返回天+行程项+住宿+成员（架构文档 3 节设计原则） */
  async getTripDetail(tripId: string) {
    const trip = await this.getTripOrThrow(tripId);
    const days = await this.tripDays.find({
      where: { tripId },
      order: { dayIndex: 'ASC' },
    });
    const dayIds = days.map((d) => d.id);
    const items = dayIds.length
      ? await this.tripItems.find({
          where: dayIds.map((tripDayId) => ({ tripDayId })),
          order: { sortOrder: 'ASC' },
          // 带上 poi，前端"导航"按钮（1.2 第2项已确认）直接用这里的经纬度调 wx.openLocation
          relations: ['poi'],
        })
      : [];
    const stays = await this.accommodations.find({
      where: { tripId },
      order: { checkInDate: 'ASC' },
    });
    const members = await this.tripMembers.find({ where: { tripId } });

    return {
      trip,
      days: days.map((day) => ({
        ...day,
        items: items.filter((i) => i.tripDayId === day.id),
      })),
      accommodations: stays,
      members,
    };
  }

  async addTripItem(dto: AddTripItemDto): Promise<TripItem> {
    const day = await this.tripDays.findOne({ where: { id: dto.tripDayId } });
    if (!day) throw new NotFoundException('行程日不存在');

    const maxOrder = await this.tripItems
      .createQueryBuilder('item')
      .where('item.tripDayId = :dayId', { dayId: dto.tripDayId })
      .select('MAX(item.sortOrder)', 'max')
      .getRawOne<{ max: number | null }>();

    const item = this.tripItems.create({
      tripDayId: dto.tripDayId,
      poiId: dto.poiId,
      category: dto.category,
      title: dto.title,
      startTime: dto.startTime,
      durationMinutes: dto.durationMinutes,
      note: dto.note,
      sortOrder: (maxOrder?.max ?? -1) + 1,
    });
    return this.tripItems.save(item);
  }

  /** 长按拖拽松手后整批重排 —— sort_order 与 start_time 互不校验（架构文档 1.2.0 已确认） */
  async reorderTripItems(dto: ReorderTripItemsDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (let index = 0; index < dto.orderedItemIds.length; index++) {
        await manager.update(
          TripItem,
          { id: dto.orderedItemIds[index], tripDayId: dto.tripDayId },
          { sortOrder: index },
        );
      }
    });
  }

  async addAccommodation(tripId: string, dto: AddAccommodationDto): Promise<Accommodation> {
    await this.getTripOrThrow(tripId);
    const stay = this.accommodations.create({
      tripId,
      poiId: dto.poiId,
      name: dto.name,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      note: dto.note,
      sortOrder: 0,
    });
    return this.accommodations.save(stay);
  }
}
