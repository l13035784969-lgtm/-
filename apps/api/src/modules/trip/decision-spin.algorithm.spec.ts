import { pickRandomParticipant } from './decision-spin.algorithm';

describe('pickRandomParticipant', () => {
  it('参与人为空时报错', () => {
    expect(() => pickRandomParticipant([])).toThrow();
  });

  it('只有一个参与人时必然抽中他', () => {
    expect(pickRandomParticipant(['a'])).toBe('a');
  });

  it('结果必然是参与人名单里的一个', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    for (let i = 0; i < 200; i++) {
      const picked = pickRandomParticipant(ids);
      expect(ids).toContain(picked);
    }
  });

  it('rng 返回 0 时抽中第一个', () => {
    expect(pickRandomParticipant(['a', 'b', 'c'], () => 0)).toBe('a');
  });

  it('rng 返回接近 1 时抽中最后一个，不会越界', () => {
    expect(pickRandomParticipant(['a', 'b', 'c'], () => 0.9999999)).toBe('c');
  });

  it('长期运行下每个人都有机会被抽中（不是死循环选同一个人）', () => {
    const ids = ['a', 'b', 'c'];
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      seen.add(pickRandomParticipant(ids));
    }
    expect(seen.size).toBe(3);
  });
});
