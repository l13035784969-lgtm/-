import {
  computeNetBalances,
  simplifyDebts,
  recalculateSplitsAfterExclusion,
  SettlementExpenseInput,
} from './settlement';

describe('computeNetBalances', () => {
  it('经典三人均摊场景：一人全垫，另两人欠他', () => {
    // 老王垫付 90 元，三人均摊每人 30 元
    const expenses: SettlementExpenseInput[] = [
      {
        amountCents: 9000,
        source: 'personal',
        payerId: 'wang',
        splits: [
          { memberId: 'wang', shareAmountCents: 3000 },
          { memberId: 'li', shareAmountCents: 3000 },
          { memberId: 'zhou', shareAmountCents: 3000 },
        ],
      },
    ];
    const net = computeNetBalances(['wang', 'li', 'zhou'], expenses);
    expect(net.get('wang')).toBe(6000); // 垫了9000，自己摊3000，净收6000
    expect(net.get('li')).toBe(-3000);
    expect(net.get('zhou')).toBe(-3000);
  });

  it('钱袋支出不算某个人垫付，只在应分摊里扣减', () => {
    const expenses: SettlementExpenseInput[] = [
      {
        amountCents: 6000,
        source: 'pool',
        splits: [
          { memberId: 'wang', shareAmountCents: 3000 },
          { memberId: 'li', shareAmountCents: 3000 },
        ],
      },
    ];
    const topUps = [
      { memberId: 'wang', amountCents: 5000 },
      { memberId: 'li', amountCents: 1000 },
    ];
    const net = computeNetBalances(['wang', 'li'], expenses, topUps);
    // wang: 充值5000 - 分摊3000 = 2000；li: 充值1000 - 分摊3000 = -2000
    expect(net.get('wang')).toBe(2000);
    expect(net.get('li')).toBe(-2000);
  });

  it('所有净余额加总应该为 0（钱不会凭空多出来或消失）', () => {
    const expenses: SettlementExpenseInput[] = [
      {
        amountCents: 12345,
        source: 'personal',
        payerId: 'a',
        splits: [
          { memberId: 'a', shareAmountCents: 4115 },
          { memberId: 'b', shareAmountCents: 4115 },
          { memberId: 'c', shareAmountCents: 4115 },
        ],
      },
    ];
    const net = computeNetBalances(['a', 'b', 'c'], expenses);
    const total = [...net.values()].reduce((sum, v) => sum + v, 0);
    expect(total).toBe(12345 - 4115 * 3); // 分摊有除不尽的尾差，净余额总和 = 该尾差
  });
});

describe('simplifyDebts', () => {
  it('两人场景：一笔转账搞定', () => {
    const net = new Map([
      ['wang', 6000],
      ['li', -6000],
    ]);
    const transfers = simplifyDebts(net);
    expect(transfers).toEqual([{ from: 'li', to: 'wang', amountCents: 6000 }]);
  });

  it('三人场景：最少转账笔数不超过 参与人数-1 笔', () => {
    const net = new Map([
      ['wang', 6000],
      ['li', -3000],
      ['zhou', -3000],
    ]);
    const transfers = simplifyDebts(net);
    expect(transfers.length).toBeLessThanOrEqual(2);
    const totalToWang = transfers.filter((t) => t.to === 'wang').reduce((s, t) => s + t.amountCents, 0);
    expect(totalToWang).toBe(6000);
  });

  it('净余额全为 0 时不产生任何转账', () => {
    const net = new Map([
      ['wang', 0],
      ['li', 0],
    ]);
    expect(simplifyDebts(net)).toEqual([]);
  });

  it('化简结果里每个人转出/转入的净额跟原始净余额一致', () => {
    const net = new Map([
      ['a', 5000],
      ['b', 2000],
      ['c', -3000],
      ['d', -4000],
    ]);
    const transfers = simplifyDebts(net);
    const settled = new Map<string, number>();
    for (const t of transfers) {
      settled.set(t.from, (settled.get(t.from) ?? 0) - t.amountCents);
      settled.set(t.to, (settled.get(t.to) ?? 0) + t.amountCents);
    }
    for (const [id, amount] of net.entries()) {
      expect(settled.get(id) ?? 0).toBe(amount);
    }
  });
});

describe('recalculateSplitsAfterExclusion', () => {
  it('三人均摊，剔除一人后剩下两人平分', () => {
    const result = recalculateSplitsAfterExclusion(10000, ['a', 'b', 'c'], ['c']);
    const a = result.find((r) => r.memberId === 'a')!;
    const b = result.find((r) => r.memberId === 'b')!;
    const c = result.find((r) => r.memberId === 'c')!;
    expect(a.shareAmountCents).toBe(5000);
    expect(b.shareAmountCents).toBe(5000);
    expect(c.excluded).toBe(true);
    expect(c.shareAmountCents).toBe(0);
  });

  it('除不尽时，多出的分钱分给前几个人，总额分毫不差', () => {
    // 100 分给 3 个人，每人 33，余 1 分给第一个人
    const result = recalculateSplitsAfterExclusion(100, ['a', 'b', 'c', 'd'], ['d']);
    const sum = result.reduce((s, r) => s + r.shareAmountCents, 0);
    expect(sum).toBe(100);
    const a = result.find((r) => r.memberId === 'a')!;
    expect(a.shareAmountCents).toBe(34); // 33 + 余下的1分
  });

  it('把所有人都剔除时报错——这笔账总得有人认', () => {
    expect(() => recalculateSplitsAfterExclusion(1000, ['a', 'b'], ['a', 'b'])).toThrow();
  });
});
