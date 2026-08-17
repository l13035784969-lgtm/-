/**
 * AA 结算算法 —— 架构文档 4.1 节，纯函数实现，方便单测覆盖，不依赖数据库。
 * 计算量小，费用模块 Service 层直接同步调用即可，不需要走异步队列。
 */

export interface SettlementExpenseInput {
  amountCents: number;
  source: 'personal' | 'pool';
  /** source=personal 时必填；source=pool 时为空（钱袋自己扣，不算某人垫付） */
  payerId?: string;
  /** 排除掉 excluded=true 的分摊记录之后传进来 */
  splits: Array<{ memberId: string; shareAmountCents: number }>;
}

export interface SettlementTopUpInput {
  memberId: string;
  amountCents: number;
}

export interface Transfer {
  from: string;
  to: string;
  amountCents: number;
}

/**
 * 净余额 = 该成员已垫付总额 + 该成员钱袋充值总额 - 该成员应分摊总额
 * source=pool 的支出不计入"已垫付"（钱已经在充值时记过了），只在"应分摊总额"里扣减。
 */
export function computeNetBalances(
  memberIds: string[],
  expenses: SettlementExpenseInput[],
  topUps: SettlementTopUpInput[] = [],
): Map<string, number> {
  const net = new Map<string, number>(memberIds.map((id) => [id, 0]));

  const addTo = (id: string, delta: number) => {
    net.set(id, (net.get(id) ?? 0) + delta);
  };

  for (const expense of expenses) {
    if (expense.source === 'personal' && expense.payerId) {
      addTo(expense.payerId, expense.amountCents);
    }
    for (const split of expense.splits) {
      addTo(split.memberId, -split.shareAmountCents);
    }
  }

  for (const topUp of topUps) {
    addTo(topUp.memberId, topUp.amountCents);
  }

  return net;
}

/**
 * 贪心化简成"最少转账笔数"：每次取当前欠款最多的人和收款最多的人做一次转账冲抵，
 * 重复直到所有净余额归零。结果只是建议，不接入真实资金转账。
 */
export function simplifyDebts(netBalances: Map<string, number>): Transfer[] {
  type Entry = { id: string; amount: number };
  const debtors: Entry[] = [];
  const creditors: Entry[] = [];

  for (const [id, amount] of netBalances.entries()) {
    if (amount < 0) debtors.push({ id, amount: -amount });
    else if (amount > 0) creditors.push({ id, amount });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      transfers.push({ from: debtor.id, to: creditor.id, amountCents: amount });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transfers;
}

/**
 * 离团结算：给定一笔 Expense 的总金额、原始分摊人和被剔除的人，
 * 按剩余人数重新平均分摊（不管原来的 split_type 是均摊/自定义/按比例，
 * 离团重算统一走"剩余人数平均分"——架构文档 1.2.2 c 已确认）。
 * 用"前面几个人多摊 1 分钱"的方式保证分摊总额跟总金额分毫不差，不会因为除不尽丢钱。
 */
export function recalculateSplitsAfterExclusion(
  amountCents: number,
  memberIds: string[],
  excludedMemberIds: string[],
): Array<{ memberId: string; shareAmountCents: number; excluded: boolean }> {
  const excludedSet = new Set(excludedMemberIds);
  const remaining = memberIds.filter((id) => !excludedSet.has(id));

  if (remaining.length === 0) {
    throw new Error('不能把所有参与人都剔除，这笔账总得有人认');
  }

  const base = Math.floor(amountCents / remaining.length);
  const remainder = amountCents - base * remaining.length;

  const remainingSplits = remaining.map((memberId, index) => ({
    memberId,
    shareAmountCents: base + (index < remainder ? 1 : 0),
    excluded: false,
  }));

  const excludedSplits = memberIds
    .filter((id) => excludedSet.has(id))
    .map((memberId) => ({ memberId, shareAmountCents: 0, excluded: true }));

  return [...remainingSplits, ...excludedSplits];
}
