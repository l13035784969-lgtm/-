import { matchPayerName, parseQuickExpenseText } from './quick-text-parser';

describe('parseQuickExpenseText', () => {
  it('解析基本格式："老王 打车 43"', () => {
    expect(parseQuickExpenseText('老王 打车 43')).toEqual({
      payerName: '老王',
      title: '打车',
      amountCents: 4300,
    });
  });

  it('带"元"后缀也能解析', () => {
    expect(parseQuickExpenseText('老王 打车 43元')).toEqual({
      payerName: '老王',
      title: '打车',
      amountCents: 4300,
    });
  });

  it('带小数金额', () => {
    expect(parseQuickExpenseText('小李 奶茶 15.5')).toEqual({
      payerName: '小李',
      title: '奶茶',
      amountCents: 1550,
    });
  });

  it('事项包含多个词也能解析', () => {
    expect(parseQuickExpenseText('老王 网红椰子饭 128')).toEqual({
      payerName: '老王',
      title: '网红椰子饭',
      amountCents: 12800,
    });
  });

  it('格式不对时返回 null，不能硬解析出错误结果', () => {
    expect(parseQuickExpenseText('随便写点什么')).toBeNull();
    expect(parseQuickExpenseText('')).toBeNull();
    expect(parseQuickExpenseText('老王 打车 -43')).toBeNull();
    expect(parseQuickExpenseText('老王 打车 0')).toBeNull();
  });
});

describe('matchPayerName', () => {
  const members = [
    { id: '1', displayName: '老王' },
    { id: '2', displayName: '小李' },
    { id: '3', displayName: '周周' },
  ];

  it('精确匹配', () => {
    expect(matchPayerName('老王', members)).toBe('1');
  });

  it('模糊匹配（识别到的名字是成员名字的子串）', () => {
    expect(matchPayerName('王', members)).toBe('1');
  });

  it('匹配不到时返回 null，交给前端弹确认，不能瞎猜', () => {
    expect(matchPayerName('张三', members)).toBeNull();
  });
});
