
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createImageElement, getContent, arrayToPoints } from './helpers';
import { TEXT_SIZE, LAYOUT } from './layout.styles';

export const SECONDARY_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Chữ & Ảnh (Content + Image)',
    type: 'two_column_image',
    slots: ['title', 'text', 'image'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Minh họa nội dung bằng hình ảnh đi kèm.',
    previewElements: [
        { type: 'TEXT', content: 'Nội dung', style: { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold' } },
        { type: 'TEXT', content: 'Mô tả...', style: { position: 'absolute', left: '8%', top: '25%', width: '40%', fontSize: '16px' } },
        { type: 'IMAGE', src: '', style: { position: 'absolute', left: '52%', top: '25%', width: '40%', height: '60%' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        createTextElement(`${slideKey}-text`, 'text', arrayToPoints(getContent(content, 'text', [])), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.CONTENT_TOP, width: '40%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor, lineHeight: '1.5' }),
        createImageElement(`${slideKey}-image`, 'image', getContent(content, 'image', { type: 'image', prompt: 'visual' }), imageCache, `slide-${slideKey}-image`, { position: 'absolute', left: '52%', top: LAYOUT.CONTENT_TOP, width: '40%', height: '60%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Ảnh nền (Image Hero)',
    type: 'title_image_background',
    slots: ['title', 'background_image'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Tạo ấn tượng mạnh với ảnh nền toàn trang.',
    previewElements: [
      { type: 'IMAGE', src: '', style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%' } },
      { type: 'TEXT', content: 'Tiêu đề nổi bật', style: { position: 'absolute', left: '10%', top: '45%', width: '80%', fontSize: '58px', fontWeight: 'bold', textAlign: 'center', color: '#fff' } },
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createImageElement(`${slideKey}-bg-img`, 'background_image', getContent(content, 'background_image', { type: 'image', prompt: 'abstract' }), imageCache, `slide-${slideKey}-background_image`, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover' }),
        { id: `${slideKey}-overlay`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)' } },
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '10%', top: '40%', width: '80%', fontSize: TEXT_SIZE.TITLE_LARGE, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: theme.titleFont, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Trích dẫn (Quote)',
      type: 'quote',
      slots: ['text', 'caption'], // Caption used for author
      priority: LayoutPriority.SECONDARY,
      usageGuideline: 'Dùng để nhấn mạnh một câu nói hay trích dẫn.',
      previewElements: [
          { type: 'TEXT', content: '“', style: { position: 'absolute', left: '10%', top: '10%', fontSize: '80px', color: '#3b82f6' } },
          { type: 'TEXT', content: 'Trích dẫn...', style: { position: 'absolute', left: '15%', top: '35%', width: '70%', fontSize: '24px' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          { id: `${slideKey}-mark`, type: 'TEXT', content: '“', style: { position: 'absolute', left: '10%', top: '20%', fontSize: '120px', fontFamily: 'serif', color: background.accentColor || theme.accentColor, opacity: 0.2 } },
          createTextElement(`${slideKey}-quote`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '15%', top: '35%', width: '70%', fontSize: TEXT_SIZE.HEADING, fontWeight: '500', fontStyle: 'italic', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor, lineHeight: '1.4' }),
          { id: `${slideKey}-line`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '45%', top: '65%', width: '10%', height: '2px', backgroundColor: background.accentColor || theme.accentColor } },
          createTextElement(`${slideKey}-author`, 'caption', getContent(content, 'caption', ''), { position: 'absolute', left: '20%', top: '70%', width: '60%', fontSize: TEXT_SIZE.BODY, fontWeight: 'bold', textAlign: 'center', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  }
];
