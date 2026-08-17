import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { PoiModule } from './modules/poi/poi.module';
import { TripModule } from './modules/trip/trip.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'trip_planner',
      autoLoadEntities: true,
      // MVP 用 synchronize 省去手写迁移；接近上线前应该切换成正式的 migration 流程
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UserModule,
    PoiModule,
    TripModule,
    ExpenseModule,
    MediaModule,
  ],
})
export class AppModule {}
