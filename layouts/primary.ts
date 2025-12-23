
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, getContent, arrayToPoints } from './helpers';

export const PRIMARY_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Tiêu đề (Premium Title)',
    type: 'title',
    slots: ['title', 'subtitle'],
    priority: LayoutPriority.PRIMARY,
    usageGuideline: 'Dùng cho tiêu đề chính. Thiết kế sang trọng với dải màu nhấn.',
    previewElements: [
      { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '45%', top: '30%', width: '10%', height: '4px', backgroundColor: '#3b82f6' } },
      { type: 'TEXT', content: 'TIÊU ĐỀ', style: { position: 'absolute', left: '10%', top: '38%', width: '80%', fontSize: '42px', fontWeight: 'bold', textAlign: 'center' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      // Accent line above title
      { id: `${slideKey}-accent`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '46%', top: '32%', width: '8%', height: '4px', backgroundColor: background.accentColor || theme.accentColor, borderRadius: '2px' } },
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', '').toUpperCase(), { position: 'absolute', left: '10%', top: '38%', width: '80%', fontSize: '56px', fontWeight: '800', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor, letterSpacing: '0.05em' }),
      createTextElement(`${slideKey}-subtitle`, 'subtitle', getContent(content, 'subtitle', ''), { position: 'absolute', left: '15%', top: '56%', width: '70%', fontSize: '22px', fontWeight: '500', textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor, opacity: 0.8 }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Nội dung (Modern Bullets)',
    type: 'content',
    slots: ['title', 'points'],
    priority: LayoutPriority.PRIMARY,
    usageGuideline: 'Dùng cho nội dung chi tiết. Phân cấp rõ ràng giữa tiêu đề và danh sách.',
    previewElements: [
        { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '8%', top: '18%', width: '40px', height: '2px', backgroundColor: '#3b82f6' } },
        { type: 'TEXT', content: 'Tiêu đề', style: { position: 'absolute', left: '8%', top: '10%', width: '80%', fontSize: '32px', fontWeight: 'bold' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        { id: `${slideKey}-side-bar`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '0', top: '0', width: '12px', height: '100%', backgroundColor: background.accentColor || theme.accentColor } },
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '10%', width: '84%', fontSize: '44px', fontWeight: '800', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        { id: `${slideKey}-title-line`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '8%', top: '20%', width: '60px', height: '3px', backgroundColor: background.accentColor || theme.accentColor } },
        createTextElement(`${slideKey}-points`, 'points', arrayToPoints(getContent(content, 'points', []), '→ '), { position: 'absolute', left: '8%', top: '28%', width: '70%', fontSize: '24px', fontFamily: theme.bodyFont, color: background.secondaryTextColor, lineHeight: '1.6' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Hai cột (Modern Comparison)',
      type: 'two_column_text',
      slots: ['title', 'left_text', 'right_text'],
      priority: LayoutPriority.PRIMARY,
      usageGuideline: 'So sánh bất đối xứng, tạo nhịp điệu hình ảnh.',
      previewElements: [
          { type: 'TEXT', content: 'Cột 1', style: { position: 'absolute', left: '8%', top: '25%', width: '40%' } },
          { type: 'TEXT', content: 'Cột 2', style: { position: 'absolute', left: '55%', top: '25%', width: '37%' } },
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '38px', fontWeight: '800', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          // Asymmetrical layout
          createTextElement(`${slideKey}-left`, 'left_text', arrayToPoints(getContent(content, 'left_text', [])), { position: 'absolute', left: '8%', top: '25%', width: '42%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
          { id: `${slideKey}-divider`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '52%', top: '25%', width: '1px', height: '60%', backgroundColor: background.secondaryTextColor, opacity: 0.2 } },
          createTextElement(`${slideKey}-right`, 'right_text', arrayToPoints(getContent(content, 'right_text', [])), { position: 'absolute', left: '56%', top: '25%', width: '36%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[],
  }
];
