import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [TripModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
