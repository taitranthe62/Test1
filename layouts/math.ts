
import { SlideTemplate, LayoutPriority, SlideElement } from '../types';
import { createTextElement, createChartElement, getContent, arrayToPoints } from './helpers';
import { TEXT_SIZE, LAYOUT } from './layout.styles';

export const MATH_LAYOUTS: SlideTemplate[] = [
  {
    name: 'Định lý & Chứng minh (Theorem Proof)',
    type: 'math_theorem_proof',
    slots: ['title', 'text', 'points'], // text: theorem, points: proof steps
    priority: LayoutPriority.TERTIARY,
    usageGuideline: 'Trình bày định lý và các bước chứng minh.',
    previewElements: [
        { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '20%', width: '80%', height: '25%', backgroundColor: '#e0f2fe' } },
        { type: 'TEXT', content: 'Định lý...', style: { position: 'absolute', left: '12%', top: '25%', width: '76%' } },
        { type: 'TEXT', content: 'Chứng minh:', style: { position: 'absolute', left: '10%', top: '50%' } }
    ],
    render: (content, theme, background, imageCache, slideKey) => [
      createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
      
      // Theorem Box
      { id: `${slideKey}-theorem-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '10%', top: '22%', width: '80%', height: '25%', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: `6px solid ${theme.accentColor}` } },
      createTextElement(`${slideKey}-theorem-label`, 'theorem_label', '<strong>ĐỊNH LÝ</strong>', { position: 'absolute', left: '12%', top: '24%', width: '76%', fontSize: '16px', fontWeight: 'bold', color: theme.accentColor, fontFamily: theme.bodyFont, letterSpacing: '0.1em' }),
      createTextElement(`${slideKey}-theorem`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '12%', top: '30%', width: '76%', fontSize: '24px', fontStyle: 'italic', fontFamily: theme.bodyFont, color: background.primaryTextColor }),

      // Proof
      createTextElement(`${slideKey}-proof-label`, 'proof_label', '<em>Chứng minh:</em>', { position: 'absolute', left: '10%', top: '52%', width: '80%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      createTextElement(`${slideKey}-proof`, 'points', arrayToPoints(getContent(content, 'points', [])), { position: 'absolute', left: '10%', top: '58%', width: '80%', fontSize: '20px', fontFamily: theme.bodyFont, color: background.primaryTextColor, lineHeight: '1.5' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
    name: 'Định nghĩa (Math Definition)',
    type: 'math_definition',
    slots: ['title', 'text'],
    priority: LayoutPriority.TERTIARY,
    usageGuideline: 'Định nghĩa trang trọng cho một khái niệm toán học.',
    previewElements: [
        { type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '15%', top: '30%', width: '70%', height: '40%', border: '2px solid #000' } },
        { type: 'TEXT', content: 'Định nghĩa', style: { position: 'absolute', left: '40%', top: '25%', width: '20%', textAlign: 'center', backgroundColor: '#fff' } }
    ],
    render: (content, theme, background, imageCache, slideKey) => [
        createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
        
        // Definition Box Frame
        { id: `${slideKey}-def-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '15%', top: '30%', width: '70%', height: '50%', backgroundColor: 'transparent', borderRadius: '12px', border: `3px solid ${theme.accentColor}` } },
        
        // Label centered on top border
        { id: `${slideKey}-def-label-bg`, type: 'SHAPE', shape: 'RECTANGLE', style: { position: 'absolute', left: '40%', top: '28%', width: '20%', height: '40px', backgroundColor: background.color } },
        createTextElement(`${slideKey}-def-label`, 'label', 'ĐỊNH NGHĨA', { position: 'absolute', left: '40%', top: '28%', width: '20%', height: '40px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', color: theme.accentColor, fontFamily: theme.bodyFont, display: 'flex', alignItems: 'center', justifyContent: 'center' }),

        createTextElement(`${slideKey}-text`, 'text', getContent(content, 'text', ''), { position: 'absolute', left: '20%', top: '38%', width: '60%', fontSize: '28px', textAlign: 'center', fontFamily: theme.bodyFont, color: background.primaryTextColor, lineHeight: '1.6' }),
    ].filter(Boolean) as SlideElement[],
  },
  {
      name: 'Giải thích Đồ thị (Graph Explanation)',
      type: 'math_graph_explanation',
      slots: ['title', 'chart', 'text'],
      priority: LayoutPriority.TERTIARY,
      usageGuideline: 'Biểu đồ bên trái, giải thích chi tiết bên phải.',
      previewElements: [
          { type: 'CHART', chartType: 'LINE', data: { labels:[], datasets:[] }, style: { position: 'absolute', left: '5%', top: '25%', width: '45%', height: '60%' } },
          { type: 'TEXT', content: 'Phân tích...', style: { position: 'absolute', left: '55%', top: '25%', width: '40%' } }
      ],
      render: (content, theme, background, imageCache, slideKey) => [
          createTextElement(`${slideKey}-title`, 'title', getContent(content, 'title', ''), { position: 'absolute', left: LAYOUT.MARGIN_X, top: LAYOUT.TITLE_TOP, width: LAYOUT.CONTENT_WIDTH, fontSize: TEXT_SIZE.TITLE, fontWeight: 'bold', fontFamily: theme.titleFont, color: background.primaryTextColor }),
          
          createChartElement(`${slideKey}-chart`, 'chart', getContent(content, 'chart', { type: 'chart', chartType: 'LINE', labels: [], datasets: [] }), { position: 'absolute', left: '5%', top: '25%', width: '45%', height: '60%' }, background),
          
          createTextElement(`${slideKey}-text`, 'text', arrayToPoints(getContent(content, 'text', [])), { position: 'absolute', left: '55%', top: '25%', width: '40%', fontSize: TEXT_SIZE.BODY, fontFamily: theme.bodyFont, color: background.secondaryTextColor }),
      ].filter(Boolean) as SlideElement[]
  }
];
