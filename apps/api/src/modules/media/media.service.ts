import { Injectable } from '@nestjs/common';
import { TripService } from '../trip/trip.service';
import { buildShareCardSvg, toDataUri } from './share-card.builder';

@Injectable()
export class MediaService {
  constructor(private readonly tripService: TripService) {}

  /** 架构文档 1.2.4 已确认：点击分享那一刻才现场生成，不预生成、不落库 */
  async generateShareCard(tripId: string): Promise<{ imageUrl: string }> {
    const trip = await this.tripService.getTripOrThrow(tripId);
    const svg = buildShareCardSvg({
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
    });
    return { imageUrl: toDataUri(svg) };
  }
}
