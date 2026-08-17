import { SplitType } from './entities/expense.entity';

export interface SplitDraft {
  memberId: string;
  shareAmountCents: number;
}

/**
 * 根据 split_type 把"总金额 + 每个人的输入"变成具体的分摊明细。
 * 均摊/自定义金额/按比例都用同一套"整除后把余数分给前几个人"的策略，
 * 保证分摊总额跟总金额分毫不差（跟 recalculateSplitsAfterExclusion 是同一个思路）。
 */
export function buildSplits(
  splitType: SplitType,
  amountCents: number,
  inputs: Array<{ memberId: string; value: number }>,
): SplitDraft[] {
  if (inputs.length === 0) {
    throw new Error('至少要有一个人分摊这笔钱');
  }

  if (splitType === '均摊') {
    const base = Math.floor(amountCents / inputs.length);
    const remainder = amountCents - base * inputs.length;
    return inputs.map((input, index) => ({
      memberId: input.memberId,
      shareAmountCents: base + (index < remainder ? 1 : 0),
    }));
  }

  if (splitType === '自定义金额') {
    const sum = inputs.reduce((s, i) => s + i.value, 0);
    if (sum !== amountCents) {
      throw new Error(`自定义分摊金额之和(${sum})跟总金额(${amountCents})对不上`);
    }
    return inputs.map((input) => ({ memberId: input.memberId, shareAmountCents: input.value }));
  }

  // 按比例：value 是权重份数
  const totalWeight = inputs.reduce((s, i) => s + i.value, 0);
  if (totalWeight <= 0) {
    throw new Error('按比例分摊时，权重总和必须大于 0');
  }
  const raw = inputs.map((input) => (amountCents * input.value) / totalWeight);
  const floored = raw.map((v) => Math.floor(v));
  let remainder = amountCents - floored.reduce((s, v) => s + v, 0);
  // 按小数部分从大到小，把余下的分依次分给权重占比更精确的人
  const order = raw
    .map((v, i) => ({ i, frac: v - floored[i] }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floored];
  for (const { i } of order) {
    if (remainder <= 0) break;
    result[i] += 1;
    remainder -= 1;
  }
  return inputs.map((input, index) => ({
    memberId: input.memberId,
    shareAmountCents: result[index],
  }));
}
