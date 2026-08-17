import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poi, PoiCategory } from './entities/poi.entity';

export interface ChooseLocationResult {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  externalId?: string;
}

@Injectable()
export class PoiService {
  constructor(
    @InjectRepository(Poi)
    private readonly pois: Repository<Poi>,
  ) {}

  /** 小程序端 wx.chooseLocation 选完点之后，前端把结果传上来存一条 POI 记录复用 */
  async createFromChooseLocation(
    result: ChooseLocationResult,
    category: PoiCategory = '其他',
  ): Promise<Poi> {
    const poi = this.pois.create({
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
      externalId: result.externalId,
      category,
    });
    return this.pois.save(poi);
  }

  async findById(id: string): Promise<Poi | null> {
    return this.pois.findOne({ where: { id } });
  }
}
