import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { tripApi } from '../../services/api';
import type { Trip } from '../../types';
import './index.scss';

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    load();
  });

  async function load() {
    setLoading(true);
    try {
      const list = await tripApi.listMine();
      setTrips(list);
    } finally {
      setLoading(false);
    }
  }

  function goCreate() {
    Taro.navigateTo({ url: '/pages/trip-create/index' });
  }

  function goDetail(tripId: string) {
    Taro.navigateTo({ url: `/pages/trip-detail/index?tripId=${tripId}` });
  }

  return (
    <View className="trip-list-page">
      <View className="header">
        <Text className="header-title">行程</Text>
        <View className="fab" onClick={goCreate}>
          +
        </View>
      </View>

      {!loading && trips.length === 0 && (
        <View className="empty">
          <Text className="empty-text">还没有行程，点右上角 + 创建一个</Text>
        </View>
      )}

      <View className="list">
        {trips.map((trip) => (
          <View key={trip.id} className="trip-card" onClick={() => goDetail(trip.id)}>
            <View className="cover" />
            <View className="card-body">
              <Text className="trip-title">{trip.title}</Text>
              <Text className="trip-meta">{formatDateRange(trip.startDate, trip.endDate)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
