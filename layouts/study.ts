
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, getContent, arrayToPoints } from './helpers';
import { TEXT_SIZE, LAYOUT } from './layout.styles';

export const STUDY_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Tiêu đề Học tập (Study Title)',
    type: 'study_title',
    slots: ['title', 'subtitle'],
    priority: LayoutPriority.PRIMARY,
    usageGuideline: 'Dùng làm trang bìa cho bộ flashcard hoặc tài liệu ôn tập.',
    previewElements: [
      { type: 'TEXT', content: 'Chủ đề học tập', style: { position: 'absolute', left: '10%', top: '40%', width: '80%', fontSize: '48px', fontWeight: 'bold', textAlign: 'center' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '10%', top: '35%', width: '80%', fontSize: TEXT_SIZE.TITLE_LARGE, fontWeight: 'bold', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor }),
      createTextElement(`${slideKey}-subtitle`, 'subtitle', getContent(content, 'subtitle', ''), { position: 'absolute', left: '10%', top: '55%', width: '80%', fontSize: TEXT_SIZE.SUBTITLE, textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Khái niệm (Study Concept)',
    type: 'study_concept',
    slots: ['title', 'text'],
    priority: LayoutPriority.PRIMARY,
    usageGuideline: 'Dùng để định nghĩa một thuật ngữ hoặc khái niệm cụ thể.',
    previewElements: [
      { type: 'TEXT', content: 'Khái niệm', style: { position: 'absolute', left: '10%', top: '15%', width: '80%', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' } },
      { type: 'TEXT', content: 'Định nghĩa...', style: { position: 'absolute', left: '15%', top: '35%', width: '70%', fontSize: '24px', textAlign: 'center' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      { id: `${slideKey}-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '10%', width: '80%', height: '80%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: `2px solid ${theme.accentColor}` } },
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '15%', top: '18%', width: '70%', fontSize: TEXT_SIZE.HEADING, fontWeight: 'bold', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor }),
      createTextElement(`${slideKey}-text`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '15%', top: '40%', width: '70%', fontSize: TEXT_SIZE.SUBTITLE, textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor, lineHeight: 1.6 }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Phân tích (Study Breakdown)',
    type: 'study_breakdown',
    slots: ['title', 'points'],
    priority: LayoutPriority.PRIMARY,
    usageGuideline: 'Liệt kê các thành phần hoặc chi tiết của một vấn đề.',
    previewElements: [
      { type: 'TEXT', content: 'Phân tích', style: { position: 'absolute', left: '10%', top: '10%', width: '80%', fontSize: '32px', fontWeight: 'bold' } },
      { type: 'TEXT', content: '• Phần 1\n• Phần 2', style: { position: 'absolute', left: '15%', top: '25%', width: '70%', fontSize: '20px' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '10%', top: '10%', width: '80%', fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
      createTextElement(`${slideKey}-points`, 'points', arrayToPoints(getContent(content, 'points', [])), { position: 'absolute', left: '12%', top: '25%', width: '76%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Hỏi & Đáp (Study Q&A)',
    type: 'study_qa',
    slots: ['title', 'text'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Định dạng câu hỏi và câu trả lời để ôn tập.',
    previewElements: [
      { type: 'TEXT', content: 'Q: Câu hỏi?', style: { position: 'absolute', left: '10%', top: '20%', width: '80%', fontSize: '24px', fontWeight: 'bold' } },
      { type: 'TEXT', content: 'A: Câu trả lời...', style: { position: 'absolute', left: '10%', top: '50%', width: '80%', fontSize: '20px' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      createTextElement(`${slideKey}-q`, 'title', `<strong>Q:</strong> ${getContent(content, 'title', '')}`, { position: 'absolute', left: '10%', top: '15%', width: '80%', fontSize: TEXT_SIZE.HEADING, fontWeight: 'bold', fontFamily: theme.titleFont, color: theme.accentColor }),
      { id: `${slideKey}-divider`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '45%', width: '80%', height: '2px', backgroundColor: '#e2e8f0' } },
      createTextElement(`${slideKey}-a`, 'text', `<strong>A:</strong> ${getContent(content, 'text', '')}`, { position: 'absolute', left: '10%', top: '55%', width: '80%', fontSize: TEXT_SIZE.SUBTITLE, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Tổng kết (Study Summary)',
    type: 'study_summary',
    slots: ['title', 'points'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Tóm tắt các ý chính đã học.',
    previewElements: [
      { type: 'TEXT', content: 'Tổng kết', style: { position: 'absolute', left: '10%', top: '10%', width: '80%', fontSize: '32px', fontWeight: 'bold', textAlign: 'center' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      createTextElement(`${slideKey}-title`, 'title', `📚 ${getContent(content, 'title', 'Tổng kết')}`, { position: 'absolute', left: '10%', top: '12%', width: '80%', fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor }),
      createTextElement(`${slideKey}-points`, 'points', arrayToPoints(getContent(content, 'points', []), '✅ '), { position: 'absolute', left: '15%', top: '30%', width: '70%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Nguồn tham khảo (Study Sources)',
      type: 'study_sources',
      slots: ['title', 'points'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Danh sách các tài liệu, sách hoặc link tham khảo.',
      previewElements: [
          { type: 'TEXT', content: 'Tài liệu tham khảo', style: { position: 'absolute', left: '10%', top: '10%' } },
          { type: 'TEXT', content: '[1] Sách A...', style: { position: 'absolute', left: '10%', top: '25%' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', 'Tài liệu tham khảo'), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          createTextElement(`${slideKey}-sources`, 'points', arrayToPoints(getContent(content, 'points', []), '[Ref] '), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.CONTENT_TOP, width: '80%', fontSize: '18px', fontFamily: 'monospace', color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  }
];
