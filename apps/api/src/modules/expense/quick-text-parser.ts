/**
 * 文字快速记账解析（架构文档 1.2.2 b 已确认，MVP 用文字替代语音）。
 * 格式："<垫付人> <事项> <金额>"，例如"老王 打车 43"或"老王 打车 43元"。
 * 纯字符串解析，不做任何数据库查询；垫付人姓名到 TripMember 的模糊匹配是调用方的事。
 * 解析失败返回 null，前端应该退回到手动表单，而不是硬解析出错误结果。
 */
export interface ParsedQuickExpense {
  payerName: string;
  title: string;
  amountCents: number;
}

// 注意：金额前必须是 \s+（至少一个空白），不能用 \s*——否则像"打车 -43"这种
// 负数会被 (.+?) 连着负号一起吞进标题里，"-43"里的数字部分单独解析成合法正数 43，
// 摊出一笔金额错误的账。\s+ 强制要求空白和数字之间不能夹着符号。
const QUICK_TEXT_PATTERN = /^(\S+)\s+(.+?)\s+[¥￥]?(\d+(?:\.\d{1,2})?)\s*(?:元|块)?$/;

export function parseQuickExpenseText(raw: string): ParsedQuickExpense | null {
  const text = raw.trim();
  if (!text) return null;

  const match = text.match(QUICK_TEXT_PATTERN);
  if (!match) return null;

  const [, payerName, title, amountStr] = match;
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    payerName,
    title: title.trim(),
    amountCents: Math.round(amount * 100),
  };
}

/**
 * 垫付人姓名模糊匹配到已加入的 TripMember：先精确匹配 display_name，
 * 匹配不到时退回给调用方处理（前端应弹出"识别到 XX，但没找到这个人"的确认草稿，
 * 不能自动瞎猜——1.2.2 b 已确认识别结果必须人工确认这一步不能省）。
 */
export function matchPayerName(
  payerName: string,
  members: Array<{ id: string; displayName: string }>,
): string | null {
  const exact = members.find((m) => m.displayName === payerName);
  if (exact) return exact.id;

  const partial = members.find(
    (m) => m.displayName.includes(payerName) || payerName.includes(m.displayName),
  );
  return partial?.id ?? null;
}
