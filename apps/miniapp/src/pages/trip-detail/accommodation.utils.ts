import type { Accommodation } from '../../types';

/**
 * 住宿跨天合并显示（架构文档 1.2.1 / 2.6 已确认）：
 * 只在入住第一天渲染一次条幅，文案覆盖 check_in_date ~ check_out_date 整个区间，
 * 中间和退房当天都不重复渲染，避免每天刷一遍同一条банner。
 */
export function findAccommodationForDay(
  date: string,
  accommodations: Accommodation[],
): Accommodation | undefined {
  return accommodations.find((a) => date >= a.checkInDate && date <= a.checkOutDate);
}

export function shouldRenderBannerOnDay(date: string, accommodation: Accommodation): boolean {
  return date === accommodation.checkInDate;
}

export function formatStayRange(accommodation: Accommodation): string {
  const fmt = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;
  return `${fmt(accommodation.checkInDate)}–${fmt(accommodation.checkOutDate)}`;
}
