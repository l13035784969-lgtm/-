import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poi } from './entities/poi.entity';
import { PoiService } from './poi.service';

@Module({
  imports: [TypeOrmModule.forFeature([Poi])],
  providers: [PoiService],
  exports: [PoiService, TypeOrmModule],
})
export class PoiModule {}
