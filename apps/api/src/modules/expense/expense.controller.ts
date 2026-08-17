import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { WalletService } from './wallet.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QuickAddDraftDto } from './dto/quick-add.dto';
import { TopUpDto } from './dto/topup.dto';

@Controller('trips/:tripId')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly walletService: WalletService,
  ) {}

  @Post('expenses')
  create(
    @Param('tripId') tripId: string,
    @Headers('x-member-id') memberId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenseService.createExpense(tripId, memberId, dto);
  }

  @Patch('expenses/:expenseId')
  update(
    @Param('expenseId') expenseId: string,
    @Headers('x-member-id') memberId: string,
    @Body() patch: UpdateExpenseDto,
  ) {
    return this.expenseService.updateExpense(expenseId, memberId, patch);
  }

  @Delete('expenses/:expenseId')
  remove(@Param('expenseId') expenseId: string) {
    return this.expenseService.deleteExpense(expenseId);
  }

  @Post('expenses/:expenseId/exclude/:memberId')
  exclude(@Param('expenseId') expenseId: string, @Param('memberId') memberId: string) {
    return this.expenseService.excludeMemberFromExpense(expenseId, memberId);
  }

  @Get('settlement')
  settlement(@Param('tripId') tripId: string) {
    return this.expenseService.getSettlement(tripId);
  }

  @Post('expenses/quick-add-draft')
  quickAddDraft(@Param('tripId') tripId: string, @Body() dto: QuickAddDraftDto) {
    return this.expenseService.buildQuickAddDraft(tripId, dto.text);
  }

  @Post('wallet/topup')
  topUp(@Param('tripId') tripId: string, @Body() dto: TopUpDto) {
    return this.walletService.topUp(tripId, dto.memberId, dto.amountCents);
  }

  @Get('wallet')
  wallet(@Param('tripId') tripId: string) {
    return this.walletService.getOrCreatePool(tripId);
  }
}
