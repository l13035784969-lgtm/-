import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseSplit } from './entities/expense-split.entity';
import { WalletPool } from './entities/wallet-pool.entity';
import { WalletTopUp } from './entities/wallet-topup.entity';
import { ExpenseService } from './expense.service';
import { WalletService } from './wallet.service';
import { ExpenseController } from './expense.controller';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseSplit, WalletPool, WalletTopUp]),
    TripModule, // 需要 TripMember 的 Repository（结算 & 文字记账姓名匹配都要查成员）
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, WalletService],
  exports: [ExpenseService, WalletService],
})
export class ExpenseModule {}
