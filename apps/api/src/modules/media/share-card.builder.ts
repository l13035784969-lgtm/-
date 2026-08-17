/**
 * 分享卡片生成（架构文档 1.2.4 已确认）：
 * - 内容尽量简单：只放标题 + 封面图 + 日期范围
 * - 点击"分享"那一刻才现场生成，不预生成、不落库、没有 ShareCard 表
 *
 * 这里用纯 SVG 拼版本代替真正的 Canvas/SSR 渲染，好处是不需要额外的 native 依赖
 * （node-canvas 之类要编译原生模块，容器里不一定装得上），SVG 本身也是合法图片格式，
 * 小程序 <image> 组件能直接显示。生产环境如果要输出 PNG/JPG，
 * 在这一层后面接一个"SVG -> 栅格化"的转换（比如 sharp 或者交给前端 Canvas 画）即可，
 * 这个函数的输出（SVG 字符串）就是那一步的输入，接口不用变。
 */
export interface ShareCardInput {
  title: string;
  destination?: string;
  startDate: string;
  endDate: string;
}

export function buildShareCardSvg(input: ShareCardInput): string {
  const dateRange = formatDateRange(input.startDate, input.endDate);
  const title = escapeXml(input.title);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="315" viewBox="0 0 600 315">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8FE0CE"/>
      <stop offset="1" stop-color="#4C9FDB"/>
    </linearGradient>
  </defs>
  <rect width="600" height="315" fill="url(#bg)"/>
  <path d="M0 220 C120 190 200 240 320 210 C440 180 520 220 600 200 V315 H0 Z" fill="#2FA98A" opacity=".55"/>
  <path d="M0 250 C120 230 200 265 320 245 C440 225 520 250 600 235 V315 H0 Z" fill="#1B7A62" opacity=".75"/>
  <text x="40" y="90" font-family="-apple-system,'PingFang SC',sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">${title}</text>
  <text x="40" y="128" font-family="-apple-system,'PingFang SC',sans-serif" font-size="18" fill="rgba(255,255,255,.9)">${escapeXml(dateRange)}</text>
</svg>`;
}

function formatDateRange(startDate: string, endDate: string): string {
  const format = (d: string) => `${Number(d.slice(5, 7))}.${Number(d.slice(8, 10))}`;
  return `${format(startDate)} - ${format(endDate)}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 直接可用于 <img src="..."> / 小程序 <image src="..."> 的 data URI */
export function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}
