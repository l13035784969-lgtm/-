/**
 * 命运轮盘的抽签算法本身——纯函数，跟数据库/框架无关，方便单测覆盖随机性边界情况。
 * 架构文档 1.2.3 已确认：结果必须由后端统一生成，这个函数就是那个"结果"的唯一来源。
 */
export function pickRandomParticipant(
  participantIds: string[],
  rng: () => number = Math.random,
): string {
  if (participantIds.length === 0) {
    throw new Error('参与人不能为空');
  }
  const index = Math.floor(rng() * participantIds.length);
  // 极端情况下 rng() 返回 1（理论上 Math.random 不会，但防御一下越界）
  const safeIndex = Math.min(index, participantIds.length - 1);
  return participantIds[safeIndex];
}
