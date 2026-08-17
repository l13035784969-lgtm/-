import Taro from '@tarojs/taro';
import type {
  Accommodation,
  DecisionSpin,
  QuickAddDraft,
  SettlementResult,
  Trip,
  TripDetail,
  TripItem,
  TripItemCategory,
  TripMember,
} from '../types';

// 生产环境应该换成正式的 API 网关域名（架构文档 3 节：小程序需走微信备案域名）
const BASE_URL = 'https://api.example.com';

/**
 * 统一请求封装。当前用户身份先靠本地存下来的 userId/memberId 走请求头占位，
 * 真实鉴权（wx.login 换 JWT）留到下一轮接入，接口形状不受影响。
 */
async function request<T>(
  url: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; data?: unknown } = {},
): Promise<T> {
  const userId = Taro.getStorageSync('userId') as string | undefined;
  const memberId = Taro.getStorageSync('currentMemberId') as string | undefined;

  const res = await Taro.request({
    url: `${BASE_URL}${url}`,
    method: options.method ?? 'GET',
    data: options.data,
    header: {
      'content-type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(memberId ? { 'x-member-id': memberId } : {}),
    },
  });

  if (res.statusCode >= 400) {
    const message = (res.data as { message?: string })?.message ?? '请求失败，请稍后再试';
    Taro.showToast({ title: message, icon: 'none' });
    throw new Error(message);
  }
  return res.data as T;
}

export const tripApi = {
  create: (dto: { title?: string; startDate: string; endDate: string; destination?: string }) =>
    request<Trip>('/trips', { method: 'POST', data: dto }),

  listMine: () => request<Trip[]>('/trips'),

  detail: (tripId: string) => request<TripDetail>(`/trips/${tripId}`),

  addItem: (
    tripId: string,
    dto: {
      tripDayId: string;
      category: TripItemCategory;
      title: string;
      poiId?: string;
      startTime?: string;
      durationMinutes?: number;
      note?: string;
    },
  ) => request<TripItem>(`/trips/${tripId}/items`, { method: 'POST', data: dto }),

  reorderItems: (tripId: string, tripDayId: string, orderedItemIds: string[]) =>
    request<void>(`/trips/${tripId}/items/reorder`, {
      method: 'PATCH',
      data: { tripDayId, orderedItemIds },
    }),

  addAccommodation: (
    tripId: string,
    dto: { name: string; checkInDate: string; checkOutDate: string; poiId?: string; note?: string },
  ) => request<Accommodation>(`/trips/${tripId}/accommodations`, { method: 'POST', data: dto }),

  addMember: (tripId: string, displayName: string) =>
    request<TripMember>(`/trips/${tripId}/members`, { method: 'POST', data: { displayName } }),

  claimMembership: (claimToken: string) =>
    request<TripMember>(`/members/claim/${claimToken}`, { method: 'POST' }),
};

export const expenseApi = {
  create: (
    tripId: string,
    dto: {
      payerId?: string;
      title: string;
      amountCents: number;
      category: string;
      expenseDate: string;
      source: 'personal' | 'pool';
      splitType: '均摊' | '自定义金额' | '按比例';
      inputMethod?: '表单' | '文字快速记账';
      splits: Array<{ memberId: string; value: number }>;
    },
  ) => request(`/trips/${tripId}/expenses`, { method: 'POST', data: dto }),

  quickAddDraft: (tripId: string, text: string) =>
    request<QuickAddDraft | null>(`/trips/${tripId}/expenses/quick-add-draft`, {
      method: 'POST',
      data: { text },
    }),

  settlement: (tripId: string) => request<SettlementResult>(`/trips/${tripId}/settlement`),

  topUp: (tripId: string, memberId: string, amountCents: number) =>
    request(`/trips/${tripId}/wallet/topup`, { method: 'POST', data: { memberId, amountCents } }),
};

export const decisionSpinApi = {
  spin: (tripId: string, topic: string, memberId: string, participantIds?: string[]) =>
    request<DecisionSpin>(`/trips/${tripId}/spins`, {
      method: 'POST',
      data: { topic, memberId, participantIds },
    }),

  void: (spinId: string, memberId: string) =>
    request<DecisionSpin>(`/spins/${spinId}/void`, { method: 'POST', data: { memberId } }),
};

export const mediaApi = {
  shareCard: (tripId: string) => request<{ imageUrl: string }>(`/trips/${tripId}/share-card`),
};
