/**
 * 金额统一用整数分（人民币分）存取，禁止在业务代码里出现浮点数运算。
 * 对应架构文档 2.2 节"金额存储"决策：避免浮点精度问题导致 AA 结算金额对不上。
 */

/** 元 -> 分（仅用于前端展示层/测试数据构造，业务逻辑一律直接用分） */
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100);
}

/** 分 -> 元（仅用于展示格式化） */
export function centsToYuan(cents: number): string {
  return (cents / 100).toFixed(2);
}
