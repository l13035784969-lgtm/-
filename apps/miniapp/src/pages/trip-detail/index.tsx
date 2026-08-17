import { useState } from 'react';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { tripApi, expenseApi, mediaApi } from '../../services/api';
import { openLocation } from '../../services/location';
import DraggableItemList from '../../components/DraggableItemList';
import AddItemSheet from '../../components/AddItemSheet';
import type { TripDetail, TripItem, QuickAddDraft } from '../../types';
import { findAccommodationForDay, formatStayRange, shouldRenderBannerOnDay } from './accommodation.utils';
import './index.scss';

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

export default function TripDetailPage() {
  const router = useRouter();
  const tripId = router.params.tripId as string;

  const [detail, setDetail] = useState<TripDetail | null>(null);
  const [sheetForDay, setSheetForDay] = useState<string | null>(null);
  const [quickText, setQuickText] = useState('');
  const [draft, setDraft] = useState<QuickAddDraft | null>(null);

  useDidShow(() => {
    if (tripId) load();
  });

  async function load() {
    const data = await tripApi.detail(tripId);
    setDetail(data);
  }

  async function submitQuickAdd() {
    if (!quickText.trim()) return;
    const result = await expenseApi.quickAddDraft(tripId, quickText.trim());
    if (!result) {
      Taro.showToast({ title: '没看懂，换个格式试试，比如「老王 打车 43」', icon: 'none' });
      return;
    }
    setDraft(result);
  }

  async function confirmQuickAdd() {
    if (!draft || !draft.payerId || !detail) return;
    const memberIds = detail.members.map((m) => m.id);
    await expenseApi.create(tripId, {
      payerId: draft.payerId,
      title: draft.parsed.title,
      amountCents: draft.parsed.amountCents,
      category: '其他',
      expenseDate: new Date().toISOString().slice(0, 10),
      source: 'personal',
      splitType: '均摊',
      inputMethod: '文字快速记账',
      splits: memberIds.map((memberId) => ({ memberId, value: 0 })),
    });
    Taro.showToast({ title: '记好了', icon: 'success' });
    setDraft(null);
    setQuickText('');
  }

  async function goSpin() {
    Taro.navigateTo({ url: `/pages/decision-spin/index?tripId=${tripId}` });
  }

  async function share() {
    const { imageUrl } = await mediaApi.shareCard(tripId);
    // data URI 小程序 <image> 可以直接展示；真正的转发用 onShareAppMessage 挂在页面上
    Taro.previewImage({ urls: [imageUrl], current: imageUrl });
  }

  function handleOpenLocation(item: TripItem) {
    if (!item.poi) {
      Taro.showToast({ title: '这个行程项还没关联具体地点', icon: 'none' });
      return;
    }
    openLocation({
      name: item.poi.name,
      address: item.poi.address ?? '',
      latitude: item.poi.latitude,
      longitude: item.poi.longitude,
    });
  }

  if (!detail) {
    return (
      <View className="loading">
        <Text>加载中…</Text>
      </View>
    );
  }

  const { trip, days, accommodations, members } = detail;

  return (
    <View className="trip-detail-page">
      <View className="banner">
        <Text className="banner-title">{trip.title}</Text>
        <Text className="banner-meta">
          {formatDateRange(trip.startDate, trip.endDate)} · {members.length}人同行
        </Text>
      </View>

      <View className="fn-row">
        <View className="fn-btn" onClick={() => {}}>
          <Text>记账</Text>
        </View>
        <View className="fn-btn" onClick={goSpin}>
          <Text>命运轮盘</Text>
        </View>
        <View className="fn-btn" onClick={share}>
          <Text>分享</Text>
        </View>
      </View>

      <View className="quick-add">
        <Input
          className="quick-add-input"
          placeholder='记一笔… 例如「老王 打车 43」'
          value={quickText}
          onInput={(e) => setQuickText(e.detail.value)}
          onConfirm={submitQuickAdd}
        />
      </View>

      {draft && (
        <View className="draft-confirm">
          {draft.matched ? (
            <Text>
              识别到：{draft.parsed.payerName} 付了「{draft.parsed.title}」{draft.parsed.amountCents / 100}
              元，全团均摊，确认记账吗？
            </Text>
          ) : (
            <Text>没找到"{draft.parsed.payerName}"这个人，换个名字或者手动记账吧</Text>
          )}
          <View className="draft-actions">
            {draft.matched && (
              <View className="confirm-btn" onClick={confirmQuickAdd}>
                确认
              </View>
            )}
            <View className="cancel-btn" onClick={() => setDraft(null)}>
              取消
            </View>
          </View>
        </View>
      )}

      <View className="day-list">
        {days.map((day) => {
          const stay = findAccommodationForDay(day.date, accommodations);
          const showStayBanner = stay && shouldRenderBannerOnDay(day.date, stay);

          const planned = day.items.filter((i) => i.startTime);
          const unplanned = day.items.filter((i) => !i.startTime);

          return (
            <View key={day.id} className="day-block">
              <View className="day-header">
                <Text className="day-title">
                  {day.date.slice(5).replace('-', '月')}日 · Day {day.dayIndex}
                </Text>
                <View className="add-btn" onClick={() => setSheetForDay(day.id)}>
                  +
                </View>
              </View>

              {showStayBanner && stay && (
                <View className="stay-banner">
                  <Text>
                    {formatStayRange(stay)} · 住 {stay.name}
                  </Text>
                </View>
              )}

              {[...planned, ...unplanned].length === 0 && (
                <View className="day-empty">
                  <Text>这天还没安排，点右上角 + 添加</Text>
                </View>
              )}

              <DraggableItemList
                items={[...planned, ...unplanned]}
                onReorder={(orderedIds) => tripApi.reorderItems(tripId, day.id, orderedIds)}
                renderItem={(item, dragHandle) => (
                  <View className="item-row">
                    {dragHandle}
                    <View className="item-body" onClick={() => handleOpenLocation(item)}>
                      <Text className="item-category">{item.category}</Text>
                      <Text className="item-title">{item.title}</Text>
                      <Text className="item-time">{item.startTime ?? '待安排'}</Text>
                    </View>
                    <View className="nav-btn" onClick={() => handleOpenLocation(item)}>
                      导航
                    </View>
                  </View>
                )}
              />
            </View>
          );
        })}
      </View>

      {sheetForDay && (
        <AddItemSheet
          tripId={tripId}
          tripDayId={sheetForDay}
          onClose={() => setSheetForDay(null)}
          onAdded={load}
        />
      )}
    </View>
  );
}
