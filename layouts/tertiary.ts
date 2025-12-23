
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createTableElement, createChartElement, getContent } from './helpers';

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
  }
];
