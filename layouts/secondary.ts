
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createImageElement, getContent, arrayToPoints } from './helpers';

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
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        createTextElement(`${slideKey}-text`, 'text', arrayToPoints(getContent(content, 'text', [])), { position: 'absolute', left: '8%', top: '25%', width: '40%', fontSize: '18px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
        createImageElement(`${slideKey}-image`, 'image', getContent(content, 'image', { type: 'image', prompt: 'visual' }), imageCache, `slide-${slideKey}-image`, { position: 'absolute', left: '52%', top: '25%', width: '40%', height: '60%', objectFit: 'cover', borderRadius: '8px' }),
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
        { id: `${slideKey}-overlay`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)' } },
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '10%', top: '45%', width: '80%', fontSize: '58px', fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: theme.titleFont }),
    ].filter(Boolean) as SlideElement[],
  }
];
