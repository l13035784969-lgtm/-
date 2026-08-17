import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { chooseLocation, ChosenLocation } from '../services/location';
import { tripApi } from '../services/api';
import type { TripItemCategory } from '../types';
import './AddItemSheet.scss';

const CATEGORIES: TripItemCategory[] = ['景点', '餐厅', '交通', '其他'];

export interface AddItemSheetProps {
  tripId: string;
  tripDayId: string;
  onClose: () => void;
  onAdded: () => void;
}

/**
 * 添加行程项 —— 底部半屏面板（架构文档 2.6 节已确认，不整页跳转）。
 * 选地点用 wx.chooseLocation（免费原生能力），时间可以不填之后再补。
 */
export default function AddItemSheet({ tripId, tripDayId, onClose, onAdded }: AddItemSheetProps) {
  const [location, setLocation] = useState<ChosenLocation | null>(null);
  const [category, setCategory] = useState<TripItemCategory>('景点');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleChooseLocation() {
    const picked = await chooseLocation();
    if (picked) {
      setLocation(picked);
      if (!title) setTitle(picked.name);
    }
  }

  async function submit() {
    if (!title.trim()) {
      Taro.showToast({ title: '请填个名字或者先选个地点', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await tripApi.addItem(tripId, {
        tripDayId,
        category,
        title: title.trim(),
        startTime: startTime || undefined, // 时间可以先不填（1.2.0 已确认）
        note: note || undefined,
        // poiId 在真正接入 POI 保存流程时补上：先把 wx.chooseLocation 的结果
        // POST 给后端 /poi/from-choose-location（未在本轮范围内建这个端点），
        // 拿到 poiId 后再传进来。这里先允许不带 poiId 创建。
      });
      onAdded();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="add-item-sheet-mask" onClick={onClose}>
      <View className="add-item-sheet" onClick={(e) => e.stopPropagation()}>
        <Text className="sheet-title">添加行程项</Text>

        <View className="field" onClick={handleChooseLocation}>
          <Text className="field-value">{location ? location.name : '选地点'}</Text>
          <Text className="field-action">{location ? '重选' : '选择'}</Text>
        </View>

        <Input
          className="title-input"
          placeholder="名字（选了地点会自动带出，也可以自己改）"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
        />

        <View className="chips">
          {CATEGORIES.map((c) => (
            <View
              key={c}
              className={`chip ${category === c ? 'on' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </View>
          ))}
        </View>

        <View className="field">
          <Text className="field-label">时间</Text>
          <Input
            className="field-input"
            placeholder="选填，可以之后再补"
            value={startTime}
            onInput={(e) => setStartTime(e.detail.value)}
          />
        </View>

        <View className="field">
          <Text className="field-label">备注</Text>
          <Input
            className="field-input"
            placeholder="选填"
            value={note}
            onInput={(e) => setNote(e.detail.value)}
          />
        </View>

        <View className={`submit-btn ${submitting ? 'disabled' : ''}`} onClick={submit}>
          添加
        </View>
      </View>
    </View>
  );
}
