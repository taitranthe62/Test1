
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createTableElement, createChartElement, getContent, arrayToPoints } from './helpers';

export const TERTIARY_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Bảng số liệu (Table)',
    type: 'content_with_table',
    slots: ['title', 'table'],
    priority: LayoutPriority.TERTIARY,
    usageGuideline: 'Trình bày dữ liệu dưới dạng bảng.',
    previewElements: [
      { type: 'TEXT', content: 'Bảng dữ liệu', style: { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold' } },
      { type: 'TABLE', rows: 3, columns: 3, cellData: [], style: { position: 'absolute', left: '8%', top: '25%', width: '84%', height: '65%' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        createTableElement(`${slideKey}-table`, 'table', getContent(content, 'table', { type: 'table', headers: [], rows: [] }), { position: 'absolute', left: '8%', top: '25%', width: '84%', height: '65%' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Biểu đồ (Chart)',
    type: 'chart_focus',
    slots: ['title', 'chart'],
    priority: LayoutPriority.TERTIARY,
    usageGuideline: 'Trực quan hóa số liệu bằng biểu đồ.',
    previewElements: [
      { type: 'TEXT', content: 'Biểu đồ', style: { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold' } },
      { type: 'CHART', chartType: 'BAR', data: { labels:[], datasets:[] }, style: { position: 'absolute', left: '8%', top: '25%', width: '84%', height: '65%' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        createChartElement(`${slideKey}-chart`, 'chart', getContent(content, 'chart', { type: 'chart', chartType: 'BAR', labels: [], datasets: [] }), { position: 'absolute', left: '8%', top: '25%', width: '84%', height: '65%' }, background),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Thống kê (Statistic)',
      type: 'statistic',
      slots: ['title', 'text', 'subtitle'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Hiển thị con số nổi bật. Text: số liệu, Subtitle: mô tả.',
      previewElements: [
          { type: 'TEXT', content: '85%', style: { position: 'absolute', left: '30%', top: '35%', width: '40%', fontSize: '80px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' } },
          { type: 'TEXT', content: 'Tăng trưởng', style: { position: 'absolute', left: '30%', top: '55%', width: '40%', fontSize: '24px', textAlign: 'center' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          // Big circular background
          { id: `${slideKey}-circle`, type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '35%', top: '25%', width: '30%', height: '53%', backgroundColor: background.accentColor || theme.accentColor, opacity: 0.1 } },
          createTextElement(`${slideKey}-stat`, 'text', getContent(content, 'text', '0'), { position: 'absolute', left: '10%', top: '32%', width: '80%', fontSize: '100px', fontWeight: '800', textAlign: 'center', fontFamily: theme.titleFont, color: background.accentColor || theme.accentColor }),
          createTextElement(`${slideKey}-desc`, 'subtitle', getContent(content, 'subtitle', ''), { position: 'absolute', left: '20%', top: '55%', width: '60%', fontSize: '24px', textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor })
      ].filter(Boolean) as SlideElement[]
  },
  {
      name: 'Mốc thời gian (Timeline)',
      type: 'timeline',
      slots: ['title', 'points'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Hiển thị các bước hoặc mốc thời gian theo trình tự.',
      previewElements: [
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '50%', width: '80%', height: '4px', backgroundColor: '#cbd5e1' } },
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '20%', top: '48%', width: '20px', height: '20px', backgroundColor: '#3b82f6' } },
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '50%', top: '48%', width: '20px', height: '20px', backgroundColor: '#3b82f6' } },
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '80%', top: '48%', width: '20px', height: '20px', backgroundColor: '#3b82f6' } },
      ],
      render: (content, theme, background, imageCache, slideKey) => {
          const points = getContent(content, 'points', []);
          const items = Array.isArray(points) ? points : [points];
          const count = Math.min(items.length, 4);
          const elements: SlideElement[] = [];
          
          elements.push(createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor })!);
          
          // Timeline Line
          elements.push({ id: `${slideKey}-line`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '50%', width: '80%', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px' } });

          if (count > 0) {
              const step = 80 / (count + 1);
              items.slice(0, 4).forEach((item, i) => {
                  const left = 10 + step * (i + 1);
                  // Dot
                  elements.push({ id: `${slideKey}-dot-${i}`, type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: `${left}%`, top: '49%', width: '16px', height: '16px', backgroundColor: background.accentColor || theme.accentColor, transform: 'translateX(-50%)' } });
                  // Text
                  elements.push(createTextElement(`${slideKey}-text-${i}`, `point-${i}`, item, { position: 'absolute', left: `${left - 10}%`, top: i % 2 === 0 ? '35%' : '55%', width: '20%', fontSize: '16px', textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor })!);
              });
          }
          return elements.filter(Boolean);
      }
  },
  {
      name: 'So sánh (Comparison)',
      type: 'content_comparison',
      slots: ['title', 'left_text', 'right_text'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'So sánh hai nội dung cạnh nhau với màu nền phân biệt.',
      previewElements: [
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '5%', top: '20%', width: '42%', height: '70%', backgroundColor: '#f1f5f9' } },
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '53%', top: '20%', width: '42%', height: '70%', backgroundColor: '#e2e8f0' } },
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          
          // Left Box
          { id: `${slideKey}-bg-left`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '5%', top: '20%', width: '44%', height: '70%', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px' } },
          createTextElement(`${slideKey}-left`, 'left_text', arrayToPoints(getContent(content, 'left_text', [])), { position: 'absolute', left: '7%', top: '23%', width: '40%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
          
          // Right Box
          { id: `${slideKey}-bg-right`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '51%', top: '20%', width: '44%', height: '70%', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '8px' } },
          createTextElement(`${slideKey}-right`, 'right_text', arrayToPoints(getContent(content, 'right_text', [])), { position: 'absolute', left: '53%', top: '23%', width: '40%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  }
];
