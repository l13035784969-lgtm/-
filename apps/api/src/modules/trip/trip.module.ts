import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripDay } from './entities/trip-day.entity';
import { TripItem } from './entities/trip-item.entity';
import { Accommodation } from './entities/accommodation.entity';
import { TripMember } from './entities/trip-member.entity';
import { DecisionSpin } from './entities/decision-spin.entity';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { TripMemberService } from './trip-member.service';
import { TripMemberController } from './trip-member.controller';
import { DecisionSpinService } from './decision-spin.service';
import { DecisionSpinController } from './decision-spin.controller';
import { PoiModule } from '../poi/poi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripDay, TripItem, Accommodation, TripMember, DecisionSpin]),
    PoiModule,
  ],
  controllers: [TripController, TripMemberController, DecisionSpinController],
  providers: [TripService, TripMemberService, DecisionSpinService],
  exports: [TripService, TripMemberService, TypeOrmModule],
})
export class TripModule {}
