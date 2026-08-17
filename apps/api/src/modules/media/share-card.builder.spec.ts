import { buildShareCardSvg, toDataUri } from './share-card.builder';

describe('buildShareCardSvg', () => {
  it('生成的 SVG 里包含标题和日期范围', () => {
    const svg = buildShareCardSvg({
      title: '8月三亚之旅',
      destination: '三亚',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
    });
    expect(svg).toContain('8月三亚之旅');
    expect(svg).toContain('8.1 - 8.5');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('标题里的特殊字符会被转义，不会把 SVG 结构搞坏', () => {
    const svg = buildShareCardSvg({
      title: '老王 & 小李 <的旅行>',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
    });
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
    expect(svg).toContain('&gt;');
    expect(svg).not.toContain('<的旅行>');
  });
});

describe('toDataUri', () => {
  it('生成合法的 data URI，能被还原回原始 SVG', () => {
    const svg = '<svg></svg>';
    const uri = toDataUri(svg);
    expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const decoded = Buffer.from(uri.split(',')[1], 'base64').toString('utf-8');
    expect(decoded).toBe(svg);
  });
});
