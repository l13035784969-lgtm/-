import { Controller, Get, Param } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('trips/:tripId/share-card')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  generate(@Param('tripId') tripId: string) {
    return this.mediaService.generateShareCard(tripId);
  }
}
