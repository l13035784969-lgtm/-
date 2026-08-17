import { useEffect, useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { tripApi, decisionSpinApi } from '../../services/api';
import type { DecisionSpin, TripMember } from '../../types';
import './index.scss';

const SPIN_ANIMATION_MS = 2600;

/**
 * 命运轮盘 · 冤大头模式（架构文档 1.2.3 已确认）：
 * 结果必须先向后端请求拿到确定值，动画只是把已经算好的结果用"转几秒再停"的
 * 形式呈现出来，不是前端自己转完再上报——这是这个页面最核心的时序约束。
 */
export default function DecisionSpinPage() {
  const router = useRouter();
  const tripId = router.params.tripId as string;

  const [members, setMembers] = useState<TripMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [topic, setTopic] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<DecisionSpin | null>(null);

  useEffect(() => {
    tripApi.detail(tripId).then((detail) => {
      setMembers(detail.members);
      setSelectedIds(new Set(detail.members.map((m) => m.id))); // 默认全员参与
    });
  }, [tripId]);

  function toggleMember(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function startSpin() {
    if (!topic.trim()) {
      Taro.showToast({ title: '先写一下本轮决策主题', icon: 'none' });
      return;
    }
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '至少要有一个人参与', icon: 'none' });
      return;
    }
    const currentMemberId = (Taro.getStorageSync('currentMemberId') as string) || members[0]?.id;
    if (!currentMemberId) return;

    // 第一步：立刻向后端要结果（结果这时候就已经确定了）
    const spinResult = await decisionSpinApi.spin(tripId, topic.trim(), currentMemberId, [
      ...selectedIds,
    ]);

    // 第二步：播放几秒动画，制造"命运正在决定"的悬念，动画结束后才展示已经算好的结果
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setResult(spinResult);
    }, SPIN_ANIMATION_MS);
  }

  function reset() {
    setResult(null);
    setTopic('');
  }

  const winner = result ? members.find((m) => m.id === result.selectedMemberId) : null;

  return (
    <View className="spin-page">
      <Text className="spin-title">命运轮盘 · 冤大头模式</Text>
      <Text className="spin-sub">转到谁，本轮就听谁的，愿赌服输</Text>

      {!result && !spinning && (
        <>
          <Input
            className="topic-input"
            placeholder="本轮决策主题，比如「晚餐吃什么」"
            value={topic}
            onInput={(e) => setTopic(e.detail.value)}
          />

          <View className="member-picker">
            {members.map((m) => (
              <View
                key={m.id}
                className={`member-chip ${selectedIds.has(m.id) ? 'on' : ''}`}
                onClick={() => toggleMember(m.id)}
              >
                {m.displayName}
              </View>
            ))}
          </View>

          <View className="spin-btn" onClick={startSpin}>
            开始转盘
          </View>
        </>
      )}

      {spinning && (
        <View className="wheel spinning">
          <Text className="wheel-hint">命运正在决定…</Text>
        </View>
      )}

      {result && winner && (
        <View className="result">
          <Text className="result-who">{winner.displayName} 本轮独裁，说了算！</Text>
          <Text className="result-sub">其他人无条件跟从，不许抱怨</Text>
          <View className="reset-btn" onClick={reset}>
            再开一轮
          </View>
        </View>
      )}
    </View>
  );
}
