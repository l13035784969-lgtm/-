import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Picker } from '@tarojs/components';
import { tripApi } from '../../services/api';
import './index.scss';

export default function TripCreate() {
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!startDate || !endDate) {
      Taro.showToast({ title: '请选日期范围', icon: 'none' });
      return;
    }
    if (startDate > endDate) {
      Taro.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const trip = await tripApi.create({
        title: title || undefined,
        destination: destination || undefined,
        startDate,
        endDate,
      });
      Taro.redirectTo({ url: `/pages/trip-detail/index?tripId=${trip.id}` });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="trip-create-page">
      <View className="field">
        <Text className="label">目的地</Text>
        <Input
          className="input"
          placeholder="比如：三亚"
          value={destination}
          onInput={(e) => setDestination(e.detail.value)}
        />
      </View>

      <View className="field">
        <Text className="label">标题（选填）</Text>
        <Input
          className="input"
          placeholder="不填自动生成，如「8月三亚之旅」"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
        />
      </View>

      <View className="field">
        <Text className="label">开始日期</Text>
        <Picker mode="date" value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
          <View className="picker-value">{startDate || '请选择'}</View>
        </Picker>
      </View>

      <View className="field">
        <Text className="label">结束日期</Text>
        <Picker mode="date" value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
          <View className="picker-value">{endDate || '请选择'}</View>
        </Picker>
      </View>

      <View className={`submit-btn ${submitting ? 'disabled' : ''}`} onClick={submit}>
        创建行程
      </View>
    </View>
  );
}
