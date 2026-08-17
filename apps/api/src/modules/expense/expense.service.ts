import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseSplit } from './entities/expense-split.entity';
import { TripMember } from '../trip/entities/trip-member.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { buildSplits } from './build-splits';
import { computeNetBalances, simplifyDebts, recalculateSplitsAfterExclusion } from './settlement';
import { parseQuickExpenseText, matchPayerName, ParsedQuickExpense } from './quick-text-parser';
import { WalletService } from './wallet.service';

export interface QuickAddDraft {
  matched: boolean;
  parsed: ParsedQuickExpense;
  payerId: string | null;
  suggestedTripMemberId: string | null;
}

@Injectable()
export class ExpenseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    @InjectRepository(ExpenseSplit) private readonly splits: Repository<ExpenseSplit>,
    @InjectRepository(TripMember) private readonly members: Repository<TripMember>,
    private readonly walletService: WalletService,
  ) {}

  async createExpense(
    tripId: string,
    createdByMemberId: string,
    dto: CreateExpenseDto,
  ): Promise<Expense> {
    const splitDrafts = buildSplits(
      dto.splitType,
      dto.amountCents,
      dto.splits.map((s) => ({ memberId: s.memberId, value: s.value })),
    );

    return this.dataSource.transaction(async (manager) => {
      const expense = manager.create(Expense, {
        tripId,
        payerId: dto.source === 'pool' ? undefined : dto.payerId,
        title: dto.title,
        amountCents: dto.amountCents,
        category: dto.category,
        expenseDate: dto.expenseDate,
        source: dto.source,
        splitType: dto.splitType,
        inputMethod: dto.inputMethod ?? '表单',
        createdBy: createdByMemberId,
      });
      const savedExpense = await manager.save(expense);

      const splitEntities = splitDrafts.map((s) =>
        manager.create(ExpenseSplit, {
          expenseId: savedExpense.id,
          memberId: s.memberId,
          shareAmountCents: s.shareAmountCents,
          excluded: false,
        }),
      );
      await manager.save(splitEntities);

      if (dto.source === 'pool') {
        await this.walletService.spendFromPool(tripId, dto.amountCents);
      }

      return savedExpense;
    });
  }

  /** 任意 TripMember 可编辑（架构文档 1.2.2 f 已确认），只记最后修改人/时间 */
  async updateExpense(
    expenseId: string,
    updatedByMemberId: string,
    patch: Partial<Pick<Expense, 'title' | 'amountCents' | 'category' | 'expenseDate'>>,
  ): Promise<Expense> {
    const expense = await this.expenses.findOne({ where: { id: expenseId } });
    if (!expense) throw new NotFoundException('这笔费用记录不存在');

    Object.assign(expense, patch);
    expense.updatedBy = updatedByMemberId;
    return this.expenses.save(expense);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.expenses.delete(expenseId);
  }

  /** 离团结算：把某成员从这笔账里剔除，剩余人重新平均分摊（架构文档 1.2.2 c 已确认） */
  async excludeMemberFromExpense(expenseId: string, excludedMemberId: string): Promise<ExpenseSplit[]> {
    const expense = await this.expenses.findOne({
      where: { id: expenseId },
      relations: ['splits'],
    });
    if (!expense) throw new NotFoundException('这笔费用记录不存在');

    const allMemberIds = (expense.splits ?? []).map((s) => s.memberId);
    const alreadyExcluded = (expense.splits ?? [])
      .filter((s) => s.excluded)
      .map((s) => s.memberId);
    const excludedMemberIds = [...new Set([...alreadyExcluded, excludedMemberId])];

    const recalculated = recalculateSplitsAfterExclusion(
      expense.amountCents,
      allMemberIds,
      excludedMemberIds,
    );

    return this.dataSource.transaction(async (manager) => {
      for (const item of recalculated) {
        await manager.update(
          ExpenseSplit,
          { expenseId, memberId: item.memberId },
          { shareAmountCents: item.shareAmountCents, excluded: item.excluded },
        );
      }
      return manager.find(ExpenseSplit, { where: { expenseId } });
    });
  }

  /** 结算方案：每个人的净余额 + 最少转账笔数的建议（架构文档 4.1 节） */
  async getSettlement(tripId: string) {
    const members = await this.members.find({ where: { tripId } });
    const memberIds = members.map((m) => m.id);

    const expenses = await this.expenses.find({ where: { tripId }, relations: ['splits'] });
    const topUps = await this.walletService.listTopUps(tripId);

    const net = computeNetBalances(
      memberIds,
      expenses.map((e) => ({
        amountCents: e.amountCents,
        source: e.source,
        payerId: e.payerId,
        splits: (e.splits ?? [])
          .filter((s) => !s.excluded)
          .map((s) => ({ memberId: s.memberId, shareAmountCents: s.shareAmountCents })),
      })),
      topUps.map((t) => ({ memberId: t.memberId, amountCents: t.amountCents })),
    );

    const transfers = simplifyDebts(net);

    return {
      netBalances: Object.fromEntries(net),
      transfers,
    };
  }

  /**
   * 文字快速记账草稿（架构文档 1.2.2 b 已确认）：只做解析+姓名匹配，不落库。
   * 前端必须把这个草稿展示给用户确认过一遍，再调 createExpense 正式入账。
   */
  async buildQuickAddDraft(tripId: string, text: string): Promise<QuickAddDraft | null> {
    const parsed = parseQuickExpenseText(text);
    if (!parsed) return null;

    const members = await this.members.find({ where: { tripId } });
    const memberId = matchPayerName(
      parsed.payerName,
      members.map((m) => ({ id: m.id, displayName: m.displayName })),
    );

    return {
      matched: memberId !== null,
      parsed,
      payerId: memberId,
      suggestedTripMemberId: memberId,
    };
  }
}
