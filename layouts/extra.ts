
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createImageElement, getContent, arrayToPoints } from './helpers';
import { TEXT_SIZE, LAYOUT } from './layout.styles';

export const EXTRA_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Tiêu điểm Ảnh (Image Focus)',
    type: 'image_focus',
    slots: ['title', 'image', 'caption'],
    priority: LayoutPriority.SECONDARY,
    usageGuideline: 'Hình ảnh lớn làm trọng tâm, kèm chú thích nhỏ.',
    previewElements: [
        { type: 'IMAGE', src: '', style: { position: 'absolute', left: '10%', top: '20%', width: '80%', height: '60%' } },
        { type: 'TEXT', content: 'Chú thích', style: { position: 'absolute', left: '10%', top: '85%', width: '80%', textAlign: 'center' } }
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: '5%', width: LAYOUT.CONTENT_WIDTH, fontSize: '32px', fontWeight: 'bold', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        createImageElement(`${slideKey}-img`, 'image', getContent(content, 'image', { type: 'image', prompt: 'focus' }), imageCache, `slide-${slideKey}-image`, { position: 'absolute', left: '10%', top: '18%', width: '80%', height: '65%', objectFit: 'contain', borderRadius: '8px' }),
        createTextElement(`${slideKey}-caption`, 'caption', getContent(content, 'caption', ''), { position: 'absolute', left: '20%', top: '85%', width: '60%', fontSize: TEXT_SIZE.CAPTION, textAlign: 'center', fontStyle: 'italic', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Ảnh Trái (Content Left Image)',
      type: 'content_left_image',
      slots: ['title', 'image', 'text'],
      priority: LayoutPriority.SECONDARY,
      usageGuideline: 'Ảnh bên trái, văn bản bên phải.',
      previewElements: [
          { type: 'IMAGE', src: '', style: { position: 'absolute', left: '5%', top: '25%', width: '40%', height: '60%' } },
          { type: 'TEXT', content: 'Nội dung', style: { position: 'absolute', left: '50%', top: '25%', width: '45%' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          createImageElement(`${slideKey}-image`, 'image', getContent(content, 'image', { type: 'image', prompt: 'visual' }), imageCache, `slide-${slideKey}-image`, { position: 'absolute', left: '5%', top: '25%', width: '40%', height: '60%', objectFit: 'cover', borderRadius: '8px' }),
          createTextElement(`${slideKey}-text`, 'text', arrayToPoints(getContent(content, 'text', [])), { position: 'absolute', left: '50%', top: '25%', width: '45%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  },
  {
      name: 'Giới thiệu Nhóm (Team Showcase)',
      type: 'team_showcase',
      slots: ['title', 'points'], // points array: "Name - Role"
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Hiển thị thành viên nhóm (3-4 người). Định dạng: "Tên - Vai trò".',
      previewElements: [
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '15%', top: '40%', width: '100px', height: '100px' } },
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '45%', top: '40%', width: '100px', height: '100px' } },
          { type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: '75%', top: '40%', width: '100px', height: '100px' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => {
          const points = getContent(content, 'points', []);
          const members = Array.isArray(points) ? points : [points];
          const count = Math.min(members.length, 4);
          const elements: SlideElement[] = [];

          elements.push(createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor })!);

          if (count > 0) {
              const widthPerItem = 90 / count;
              members.slice(0, 4).forEach((memberStr, i) => {
                  const left = 5 + (i * widthPerItem);
                  const [name, role] = memberStr.split(/[-–:]/).map((s: string) => s.trim());
                  
                  // Avatar placeholder
                  elements.push({ id: `${slideKey}-avatar-${i}`, type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: `${left + widthPerItem/2 - 6}%`, top: '35%', width: '12%', paddingTop: '12%', height: '0', backgroundColor: '#e2e8f0' } }); // Hack for aspect ratio in CSS? No, using fixed % width
                  // Better circle:
                  elements.push({ id: `${slideKey}-avatar-real-${i}`, type: 'SHAPE', shape: 'ELLIPSE', style: { position: 'absolute', left: `${left + widthPerItem/2 - 6}%`, top: '35%', width: '130px', height: '130px', backgroundColor: '#cbd5e1', transform: 'translateX(-50%)' } });
                  
                  // Initial
                  elements.push(createTextElement(`${slideKey}-initial-${i}`, `initial-${i}`, name ? name[0] : '?', { position: 'absolute', left: `${left + widthPerItem/2 - 6}%`, top: '38%', width: '130px', height: '130px', fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#64748b', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' })!);

                  // Name
                  elements.push(createTextElement(`${slideKey}-name-${i}`, `name-${i}`, name || '', { position: 'absolute', left: `${left}%`, top: '58%', width: `${widthPerItem}%`, fontSize: '20px', fontWeight: 'bold', textAlign: 'center', fontFamily: theme.titleFont, color: background.primaryTextColor })!);
                  
                  // Role
                  if (role) {
                      elements.push(createTextElement(`${slideKey}-role-${i}`, `role-${i}`, role, { position: 'absolute', left: `${left}%`, top: '63%', width: `${widthPerItem}%`, fontSize: '16px', textAlign: 'center', fontFamily: theme.bodyFont, color: theme.accentColor })!);
                  }
              });
          }
          return elements.filter(Boolean);
      }
  },
  {
      name: 'Nhiều Cột (Multi-column)',
      type: 'content_multi_column',
      slots: ['title', 'points'], // points array splits into 3 columns
      priority: LayoutPriority.SECONDARY,
      usageGuideline: 'Chia nội dung thành 3 cột đều nhau.',
      previewElements: [
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '5%', top: '30%', width: '28%', height: '50%' } },
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '36%', top: '30%', width: '28%', height: '50%' } },
          { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '67%', top: '30%', width: '28%', height: '50%' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => {
          const points = getContent(content, 'points', []);
          const items = Array.isArray(points) ? points : [points];
          
          // Split items into 3 chunks
          const chunkSize = Math.ceil(items.length / 3);
          const cols = [[], [], []] as string[][];
          items.forEach((item, i) => {
              if (i < chunkSize) cols[0].push(item);
              else if (i < chunkSize * 2) cols[1].push(item);
              else cols[2].push(item);
          });

          const elements: SlideElement[] = [];
          elements.push(createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor })!);

          // Render 3 columns
          [5, 36, 67].forEach((leftPos, i) => {
              if (cols[i].length > 0) {
                  elements.push(createTextElement(`${slideKey}-col-${i}`, `col-${i}`, arrayToPoints(cols[i]), { position: 'absolute', left: `${leftPos}%`, top: '25%', width: '28%', fontSize: '18px', fontFamily: theme.bodyFont, color: background.secondaryTextColor })!);
              }
          });

          return elements.filter(Boolean);
      }
  },
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
      createTextElement(`${slideKey}-text`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '10%', top: '45%', width: '80%', fontSize: TEXT_SIZE.TITLE_LARGE, fontWeight: '800', textAlign: 'center', fontFamily: theme.titleFont, color: '#ffffff', lineHeight: '1.2' }),
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
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          createTextElement(`${slideKey}-left`, 'left_text', arrayToPoints(getContent(content, 'left_text', [])), { position: 'absolute', left: '8%', top: '25%', width: '40%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
          createTextElement(`${slideKey}-right`, 'right_text', arrayToPoints(getContent(content, 'right_text', [])), { position: 'absolute', left: '52%', top: '25%', width: '40%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
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

          elements.push(createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor })!);

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
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        // Background for equation
        { id: `${slideKey}-eq-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '15%', top: '35%', width: '70%', height: '30%', backgroundColor: '#f8fafc', border: `1px solid ${background.accentColor}`, borderRadius: '12px' } },
        createTextElement(`${slideKey}-eq`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '15%', top: '35%', width: '70%', height: '30%', fontSize: '32px', textAlign: 'center', fontFamily: theme.bodyFont, color: background.primaryTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    ].filter(Boolean) as SlideElement[]
  }
];
