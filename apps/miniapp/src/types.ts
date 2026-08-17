/**
 * 前后端共享的类型定义（架构文档 6 节："共享 TypeScript 类型定义，减少前后端字段不一致"）。
 * 字段名跟 apps/api 的实体保持一致，后续如果搭 Monorepo 级别的共享包，
 * 这个文件可以直接搬过去给两边 import。
 */

export type TripItemCategory = '景点' | '餐厅' | '交通' | '其他';
export type ExpenseCategory = '餐饮' | '交通' | '门票' | '住宿' | '其他';
export type ExpenseSource = 'personal' | 'pool';
export type SplitType = '均摊' | '自定义金额' | '按比例';

export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  destination?: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface Poi {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface TripItem {
  id: string;
  tripDayId: string;
  poiId?: string;
  poi?: Poi;
  category: TripItemCategory;
  title: string;
  startTime?: string;
  durationMinutes?: number;
  sortOrder: number;
  note?: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  date: string;
  dayIndex: number;
  items: TripItem[];
}

export interface Accommodation {
  id: string;
  tripId: string;
  poiId?: string;
  name: string;
  checkInDate: string;
  checkOutDate: string;
  note?: string;
}

export interface TripMember {
  id: string;
  tripId: string;
  userId?: string;
  displayName: string;
  claimToken?: string;
  joinedAt: string;
}

export interface TripDetail {
  trip: Trip;
  days: TripDay[];
  accommodations: Accommodation[];
  members: TripMember[];
}

export interface DecisionSpin {
  id: string;
  tripId: string;
  topic: string;
  participantIds: string[];
  selectedMemberId: string;
  status: 'active' | 'voided';
  createdBy: string;
  createdAt: string;
}

export interface QuickAddDraft {
  matched: boolean;
  parsed: { payerName: string; title: string; amountCents: number };
  payerId: string | null;
  suggestedTripMemberId: string | null;
}

export interface SettlementResult {
  netBalances: Record<string, number>;
  transfers: Array<{ from: string; to: string; amountCents: number }>;
}
