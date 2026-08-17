import { buildSplits } from './build-splits';

describe('buildSplits', () => {
  it('均摊：除不尽时前几个人多摊1分', () => {
    const result = buildSplits('均摊', 100, [
      { memberId: 'a', value: 0 },
      { memberId: 'b', value: 0 },
      { memberId: 'c', value: 0 },
    ]);
    const sum = result.reduce((s, r) => s + r.shareAmountCents, 0);
    expect(sum).toBe(100);
    expect(result[0].shareAmountCents).toBe(34);
    expect(result[1].shareAmountCents).toBe(33);
    expect(result[2].shareAmountCents).toBe(33);
  });

  it('自定义金额：按输入原样返回', () => {
    const result = buildSplits('自定义金额', 10000, [
      { memberId: 'a', value: 7000 },
      { memberId: 'b', value: 3000 },
    ]);
    expect(result).toEqual([
      { memberId: 'a', shareAmountCents: 7000 },
      { memberId: 'b', shareAmountCents: 3000 },
    ]);
  });

  it('自定义金额：总和对不上时报错', () => {
    expect(() =>
      buildSplits('自定义金额', 10000, [
        { memberId: 'a', value: 7000 },
        { memberId: 'b', value: 2000 },
      ]),
    ).toThrow();
  });

  it('按比例：2:1 权重分 100 分', () => {
    const result = buildSplits('按比例', 100, [
      { memberId: 'a', value: 2 },
      { memberId: 'b', value: 1 },
    ]);
    const sum = result.reduce((s, r) => s + r.shareAmountCents, 0);
    expect(sum).toBe(100);
    expect(result[0].shareAmountCents).toBeCloseTo(67, 0);
    expect(result[1].shareAmountCents).toBeCloseTo(33, 0);
  });

  it('参与人为空时报错', () => {
    expect(() => buildSplits('均摊', 100, [])).toThrow();
  });
});
