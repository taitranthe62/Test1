
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, getContent, arrayToPoints } from './helpers';

export const EXTRA_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Tuyên bố (Statement)',
    type: 'statement',
    slots: ['title', 'text'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Dùng cho một câu tuyên bố mạnh mẽ hoặc thông điệp cốt lõi.',
    previewElements: [
      { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: '#1e3a8a' } },
      { type: 'TEXT', content: 'BIG IDEA', style: { position: 'absolute', left: '10%', top: '40%', width: '80%', fontSize: '60px', fontWeight: 'bold', textAlign: 'center', color: '#fff' } }
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      // Solid background block
      { id: `${slideKey}-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: background.accentColor || theme.accentColor } },
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', '').toUpperCase(), { position: 'absolute', left: '10%', top: '30%', width: '80%', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', fontFamily: theme.bodyFont, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.2em' }),
      createTextElement(`${slideKey}-text`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '10%', top: '45%', width: '80%', fontSize: '64px', fontWeight: '800', textAlign: 'center', fontFamily: theme.titleFont, color: '#ffffff', lineHeight: '1.2' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Hai Cột Văn Bản (Two Column Text)',
      type: 'content_two_column',
      slots: ['title', 'left_text', 'right_text'],
      priority: LayoutPriority.PRIMARY,
      usageGuideline: 'Hai cột văn bản song song cân xứng.',
      previewElements: [
          { type: 'TEXT', content: 'Tiêu đề', style: { position: 'absolute', left: '8%', top: '10%', fontSize: '32px' } },
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '8%', top: '25%', width: '40%', height: '60%', backgroundColor: '#f1f5f9' } },
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '52%', top: '25%', width: '40%', height: '60%', backgroundColor: '#f1f5f9' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '38px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          createTextElement(`${slideKey}-left`, 'left_text', arrayToPoints(getContent(content, 'left_text', [])), { position: 'absolute', left: '8%', top: '25%', width: '40%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
          createTextElement(`${slideKey}-right`, 'right_text', arrayToPoints(getContent(content, 'right_text', [])), { position: 'absolute', left: '52%', top: '25%', width: '40%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  },
  {
      name: 'Quy trình (Process Flow)',
      type: 'process_flow',
      slots: ['title', 'points'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Mô tả quy trình 3-4 bước.',
      previewElements: [
           { type: 'ICON', iconName: 'ArrowRight', style: { position: 'absolute', left: '30%', top: '50%' } },
           { type: 'ICON', iconName: 'ArrowRight', style: { position: 'absolute', left: '60%', top: '50%' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => {
          const points = getContent(content, 'points', []);
          const items = Array.isArray(points) ? points : [points];
          const count = Math.min(items.length, 4);
          const elements: SlideElement[] = [];

          elements.push(createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '38px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor })!);

          if (count > 0) {
              const widthPerItem = 80 / count;
              items.slice(0, 4).forEach((item, i) => {
                  const left = 10 + (i * widthPerItem);
                  
                  // Box
                  elements.push({ id: `${slideKey}-box-${i}`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: `${left + 1}%`, top: '40%', width: `${widthPerItem - 2}%`, height: '20%', backgroundColor: i % 2 === 0 ? (background.accentColor || theme.accentColor) : '#e2e8f0', borderRadius: '8px' } });
                  
                  // Text inside box
                  elements.push(createTextElement(`${slideKey}-text-${i}`, `point-${i}`, item, { position: 'absolute', left: `${left + 2}%`, top: '42%', width: `${widthPerItem - 4}%`, height: '16%', fontSize: '16px', textAlign: 'center', fontFamily: theme.bodyFont, color: i % 2 === 0 ? '#ffffff' : background.secondaryTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center' })!);

                  // Arrow (if not last)
                  if (i < count - 1) {
                      elements.push({ id: `${slideKey}-arrow-${i}`, type: 'ICON', iconName: 'ArrowRight', style: { position: 'absolute', left: `${left + widthPerItem - 2}%`, top: '48%', width: '4%', height: '4%', color: background.secondaryTextColor, zIndex: 10 } });
                  }
              });
          }
          return elements.filter(Boolean);
      }
  },
  {
    name: 'Công thức Toán (Math Equation)',
    type: 'math_equation_centered',
    slots: ['title', 'text'],
    priority: LayoutPriority.TERTIARY,
    usageGuideline: 'Hiển thị công thức toán học ở chính giữa.',
    previewElements: [
        { type: 'TEXT', content: '$$ E = mc^2 $$', style: { position: 'absolute', left: '20%', top: '40%', width: '60%', fontSize: '40px', textAlign: 'center' } }
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: '8%', top: '8%', width: '84%', fontSize: '34px', fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        // Background for equation
        { id: `${slideKey}-eq-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '15%', top: '35%', width: '70%', height: '30%', backgroundColor: '#f8fafc', border: `1px solid ${background.accentColor}`, borderRadius: '12px' } },
        createTextElement(`${slideKey}-eq`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '15%', top: '35%', width: '70%', height: '30%', fontSize: '32px', textAlign: 'center', fontFamily: theme.bodyFont, color: background.primaryTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    ].filter(Boolean) as SlideElement[]
  }
];
