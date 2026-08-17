import { enumerateDates, formatDefaultTitle } from './trip.utils';

describe('enumerateDates', () => {
  it('枚举闭区间内的每一天', () => {
    expect(enumerateDates('2026-08-01', '2026-08-05')).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
    ]);
  });

  it('单日行程只生成一天', () => {
    expect(enumerateDates('2026-08-01', '2026-08-01')).toEqual(['2026-08-01']);
  });

  it('跨月也能正确枚举', () => {
    expect(enumerateDates('2026-08-30', '2026-09-02')).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
    ]);
  });

  it('开始日期晚于结束日期时报错', () => {
    expect(() => enumerateDates('2026-08-05', '2026-08-01')).toThrow();
  });
});

describe('formatDefaultTitle', () => {
  it('有目的地时生成"8月三亚之旅"这种标题', () => {
    expect(formatDefaultTitle('三亚', '2026-08-01')).toBe('8月三亚之旅');
  });

  it('没填目的地时退化成"8月的旅行"', () => {
    expect(formatDefaultTitle(undefined, '2026-08-01')).toBe('8月的旅行');
  });
});
