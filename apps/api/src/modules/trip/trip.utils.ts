/** 按 [startDate, endDate] 闭区间枚举每一天，返回 'YYYY-MM-DD' 数组，用于生成 TripDay */
export function enumerateDates(startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('日期格式不正确');
  }
  if (start > end) {
    throw new Error('开始日期不能晚于结束日期');
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/** 标题留空时的默认值，如"8月三亚之旅"；没有目的地就退化成"8月的旅行" */
export function formatDefaultTitle(destination: string | undefined, startDate: string): string {
  const month = Number(startDate.slice(5, 7));
  return destination ? `${month}月${destination}之旅` : `${month}月的旅行`;
}
