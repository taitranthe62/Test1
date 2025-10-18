import { SlideTemplate } from './types';

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  // --- Original Templates (Still Great!) ---
  {
    name: 'Modern Title',
    type: 'title',
    elements: [
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '8%', top: '38%', width: '84%', height: 'auto',
          fontSize: '68px', fontWeight: 'bold', textAlign: 'left', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[SUBTITLE]',
        style: {
          position: 'absolute', left: '8%', top: '58%', width: '84%', height: 'auto',
          fontSize: '24px', textAlign: 'left', color: '#555555', fontFamily: '"Lato", sans-serif', lineHeight: 1.4,
        },
      },
    ],
    backgroundColor: '#f8f9fa',
  },
  {
    name: 'Image Background Title',
    type: 'title_image_background',
    elements: [
      {
        type: 'IMAGE',
        src: '[IMAGE_URL]',
        style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover' }
      },
      {
        type: 'TEXT',
        content: '',
        style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      },
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '10%', top: '45%', width: '80%', height: 'auto',
          fontSize: '72px', fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: '"Playfair Display", serif', lineHeight: 1.2,
        },
      },
    ],
    backgroundColor: '#000000',
  },
  {
    name: 'Dark Mode Section',
    type: 'section_header',
    elements: [
      {
        type: 'TEXT',
        content: '[SUBTITLE]', // e.g., "01" or "Section 1"
        style: {
          position: 'absolute', left: '8%', top: '25%', width: '84%', height: 'auto',
          fontSize: '72px', fontWeight: 'bold', color: '#4dabf7', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.1,
        },
      },
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '8%', top: '45%', width: '80%', height: 'auto',
          fontSize: '48px', fontWeight: 'bold', textAlign: 'left', color: '#ffffff', paddingBottom: '10px', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
    ],
    backgroundColor: '#1f2937',
  },
    // --- New Canva-Inspired Templates ---
  {
    name: 'Three Column Features',
    type: 'content_three_column',
    elements: [
        { type: 'TEXT', content: '[TITLE]', style: { position: 'absolute', left: '8%', top: '10%', width: '84%', height: 'auto', fontSize: '42px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        // Column 1
        { type: 'TEXT', content: '[COLUMN_1_TITLE]', style: { position: 'absolute', left: '8%', top: '30%', width: '25%', height: 'auto', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[COLUMN_1_TEXT]', style: { position: 'absolute', left: '8%', top: '45%', width: '25%', height: 'auto', fontSize: '18px', textAlign: 'center', color: '#555555', lineHeight: '1.5', fontFamily: '"Lato", sans-serif' } },
        // Column 2
        { type: 'TEXT', content: '[COLUMN_2_TITLE]', style: { position: 'absolute', left: '37.5%', top: '30%', width: '25%', height: 'auto', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[COLUMN_2_TEXT]', style: { position: 'absolute', left: '37.5%', top: '45%', width: '25%', height: 'auto', fontSize: '18px', textAlign: 'center', color: '#555555', lineHeight: '1.5', fontFamily: '"Lato", sans-serif' } },
        // Column 3
        { type: 'TEXT', content: '[COLUMN_3_TITLE]', style: { position: 'absolute', left: '67%', top: '30%', width: '25%', height: 'auto', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[COLUMN_3_TEXT]', style: { position: 'absolute', left: '67%', top: '45%', width: '25%', height: 'auto', fontSize: '18px', textAlign: 'center', color: '#555555', lineHeight: '1.5', fontFamily: '"Lato", sans-serif' } },
    ],
    backgroundColor: '#f8f9fa',
  },
  {
    name: 'Image & Bullets',
    type: 'content_image_bullets',
    elements: [
        { type: 'TEXT', content: '[TITLE]', style: { position: 'absolute', left: '5%', top: '15%', width: '40%', height: 'auto', fontSize: '40px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[POINTS]', style: { position: 'absolute', left: '7%', top: '35%', width: '38%', height: 'auto', fontSize: '22px', color: '#333333', lineHeight: '1.8', fontFamily: '"Open Sans", sans-serif', whiteSpace: 'pre-wrap' } },
        { type: 'IMAGE', src: '[IMAGE_URL]', style: { position: 'absolute', right: '0', top: '0', width: '50%', height: '100%', objectFit: 'cover' } }
    ],
    backgroundColor: '#ffffff',
  },
  {
    name: 'Vertical Timeline',
    type: 'timeline',
    elements: [
        { type: 'TEXT', content: '[TITLE]', style: { position: 'absolute', left: '10%', top: '10%', width: '80%', height: 'auto', fontSize: '52px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '', style: { position: 'absolute', left: '50%', top: '25%', width: '4px', height: '65%', backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
        { type: 'TEXT', content: '[POINTS]', style: { position: 'absolute', left: '20%', top: '28%', width: '60%', height: 'auto', fontSize: '22px', color: '#e5e7eb', lineHeight: '2.5', fontFamily: '"Roboto", sans-serif', whiteSpace: 'pre-wrap', textAlign: 'center' } },
    ],
    backgroundColor: '#1f2937',
  },
  {
    name: 'Comparison',
    type: 'content_comparison',
    elements: [
        { type: 'TEXT', content: '[TITLE]', style: { position: 'absolute', left: '10%', top: '10%', width: '80%', height: 'auto', fontSize: '42px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '', style: { position: 'absolute', left: '50%', top: '25%', width: '2px', height: '60%', backgroundColor: '#d1d5db' } },
        { type: 'TEXT', content: '[LEFT_TITLE]', style: { position: 'absolute', left: '10%', top: '25%', width: '35%', height: 'auto', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', color: '#10b981', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[POINTS_LEFT]', style: { position: 'absolute', left: '10%', top: '40%', width: '35%', height: 'auto', fontSize: '18px', color: '#444444', lineHeight: '1.6', fontFamily: '"Lato", sans-serif', whiteSpace: 'pre-wrap' } },
        { type: 'TEXT', content: '[RIGHT_TITLE]', style: { position: 'absolute', left: '55%', top: '25%', width: '35%', height: 'auto', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', color: '#ef4444', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'TEXT', content: '[POINTS_RIGHT]', style: { position: 'absolute', left: '55%', top: '40%', width: '35%', height: 'auto', fontSize: '18px', color: '#444444', lineHeight: '1.6', fontFamily: '"Lato", sans-serif', whiteSpace: 'pre-wrap' } },
    ],
    backgroundColor: '#f8fafc',
  },
  {
    name: 'Minimalist Statement',
    type: 'statement',
    elements: [
      {
        type: 'TEXT',
        content: '[QUOTE]',
        style: {
          position: 'absolute', left: '10%', top: '30%', width: '80%', height: 'auto',
          fontSize: '64px', fontWeight: '600', fontStyle: 'italic', textAlign: 'center', color: '#ffffff', fontFamily: '"Playfair Display", serif', lineHeight: 1.4,
        },
      },
    ],
    backgroundColor: '#4338ca', // Indigo
  },
  {
    name: 'Image Grid',
    type: 'content_image_grid',
    elements: [
        { type: 'TEXT', content: '[TITLE]', style: { position: 'absolute', left: '5%', top: '8%', width: '90%', height: 'auto', fontSize: '42px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif' } },
        { type: 'IMAGE', src: '[IMAGE_URL_1]', style: { position: 'absolute', left: '5%', top: '25%', width: '43%', height: '60%', objectFit: 'cover', borderRadius: '8px' } },
        { type: 'IMAGE', src: '[IMAGE_URL_2]', style: { position: 'absolute', right: '5%', top: '25%', width: '43%', height: '60%', objectFit: 'cover', borderRadius: '8px' } },
    ],
    backgroundColor: '#ffffff',
  },
  // --- Original Templates (Continued) ---
  {
    name: 'Agenda',
    type: 'agenda',
    elements: [
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '10%', top: '10%', width: '80%', height: 'auto',
          fontSize: '52px', fontWeight: 'bold', color: '#1a1a1a', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[POINTS]', // Will be replaced with a list
        style: {
          position: 'absolute', left: '15%', top: '30%', width: '70%', height: 'auto',
          fontSize: '28px', color: '#333333', lineHeight: '1.8', fontFamily: '"Open Sans", sans-serif', whiteSpace: 'pre-wrap'
        },
      },
    ],
    backgroundColor: '#f8fafc',
  },
  {
    name: 'Content with Image Left',
    type: 'content_left_image',
    elements: [
      {
        type: 'IMAGE',
        src: '[IMAGE_URL]',
        style: {
          position: 'absolute', left: '0', top: '0', width: '50%', height: '100%', objectFit: 'cover'
        },
      },
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '55%', top: '20%', width: '40%', height: 'auto',
          fontSize: '48px', fontWeight: 'bold', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[TEXT]',
        style: {
          position: 'absolute', left: '55%', top: '40%', width: '40%', height: 'auto',
          fontSize: '22px', color: '#555555', lineHeight: '1.6', fontFamily: '"Lato", sans-serif', whiteSpace: 'pre-wrap'
        },
      },
    ],
    backgroundColor: '#ffffff',
  },
  {
    name: 'Two Column Content',
    type: 'content_two_column',
    elements: [
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '8%', top: '8%', width: '84%', height: 'auto',
          fontSize: '42px', fontWeight: 'bold', textAlign: 'left', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[LEFT_TEXT]',
        style: {
          position: 'absolute', left: '8%', top: '28%', width: '40%', height: 'auto',
          fontSize: '18px', color: '#444444', lineHeight: '1.5', fontFamily: '"Lato", sans-serif', whiteSpace: 'pre-wrap'
        },
      },
      {
        type: 'TEXT',
        content: '[RIGHT_TEXT]',
        style: {
          position: 'absolute', left: '52%', top: '28%', width: '40%', height: 'auto',
          fontSize: '18px', color: '#444444', lineHeight: '1.5', fontFamily: '"Lato", sans-serif', whiteSpace: 'pre-wrap'
        },
      },
    ],
    backgroundColor: '#f9f9f9',
  },
  {
    name: 'Quote Slide',
    type: 'quote',
    elements: [
       {
        type: 'TEXT',
        content: '“',
        style: {
          position: 'absolute', left: '10%', top: '15%', width: 'auto', height: 'auto',
          fontSize: '150px', fontWeight: 'bold', color: '#e0e0e0', fontFamily: '"Playfair Display", serif', lineHeight: 1,
        },
      },
      {
        type: 'TEXT',
        content: '[QUOTE]',
        style: {
          position: 'absolute', left: '15%', top: '40%', width: '70%', height: 'auto',
          fontSize: '44px', fontWeight: '500', fontStyle: 'italic', textAlign: 'center', color: '#333333', fontFamily: '"Playfair Display", serif', lineHeight: 1.4,
        },
      },
      {
        type: 'TEXT',
        content: '— [AUTHOR]',
        style: {
          position: 'absolute', left: '15%', top: '65%', width: '70%', height: 'auto',
          fontSize: '24px', textAlign: 'right', color: '#777777', fontFamily: '"Lato", sans-serif', lineHeight: 1.2,
        },
      },
    ],
    backgroundColor: '#fdf6e3',
  },
  {
    name: 'Big Number / Statistic',
    type: 'statistic',
    elements: [
       {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '10%', top: '20%', width: '80%', height: 'auto',
          fontSize: '32px', textAlign: 'center', color: '#d1d5db', fontFamily: '"Montserrat", sans-serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[STATISTIC]',
        style: {
          position: 'absolute', left: '10%', top: '35%', width: '80%', height: 'auto',
          fontSize: '140px', fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: '"Roboto", sans-serif', lineHeight: 1,
        },
      },
      {
        type: 'TEXT',
        content: '[DESCRIPTION]',
        style: {
          position: 'absolute', left: '20%', top: '70%', width: '60%', height: 'auto',
          fontSize: '24px', textAlign: 'center', color: '#e5e7eb', fontFamily: '"Lato", sans-serif', lineHeight: 1.4,
        },
      },
    ],
    backgroundColor: '#1f2937',
  },
  {
    name: 'Thank You / Contact',
    type: 'conclusion',
    elements: [
      {
        type: 'TEXT',
        content: '[TITLE]',
        style: {
          position: 'absolute', left: '10%', top: '30%', width: '80%', height: 'auto',
          fontSize: '72px', fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: '"Playfair Display", serif', lineHeight: 1.2,
        },
      },
      {
        type: 'TEXT',
        content: '[TEXT]',
        style: {
          position: 'absolute', left: '10%', top: '50%', width: '80%', height: 'auto',
          fontSize: '36px', textAlign: 'center', color: '#dbeafe', fontFamily: '"Lato", sans-serif', lineHeight: 1.4,
        },
      },
    ],
    backgroundColor: '#2563eb',
  }
];


// --- New Templates for Study Deck Mode ---
export const STUDY_DECK_TEMPLATES: SlideTemplate[] = [
  {
    name: 'Study - Title Card',
    type: 'study_title',
    elements: [
      {
        type: 'TEXT', content: '[TITLE]',
        style: { position: 'absolute', left: '6%', top: '35%', width: '88%', height: 'auto', fontSize: '56px', fontWeight: 'bold', color: '#111827', fontFamily: '"Georgia", serif', textAlign: 'center' },
      },
      {
        type: 'TEXT', content: '[SUBTITLE]',
        style: { position: 'absolute', left: '6%', top: '55%', width: '88%', height: 'auto', fontSize: '24px', color: '#4b5563', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      },
    ],
    backgroundColor: '#f9fafb',
  },
  {
    name: 'Study - Key Concept',
    type: 'study_concept',
    elements: [
      {
        type: 'TEXT', content: '[TITLE]',
        style: { position: 'absolute', left: '6%', top: '8%', width: '88%', height: 'auto', fontSize: '32px', fontWeight: 'bold', color: '#111827', fontFamily: '"Inter", sans-serif', borderBottom: '1px solid #d1d5db', paddingBottom: '12px' },
      },
      {
        type: 'TEXT', content: '[TEXT]',
        style: { position: 'absolute', left: '6%', top: '25%', width: '88%', height: 'auto', fontSize: '20px', color: '#374151', fontFamily: '"Georgia", serif', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
      },
    ],
    backgroundColor: '#ffffff',
  },
  {
    name: 'Study - Detailed Breakdown',
    type: 'study_breakdown',
    elements: [
      {
        type: 'TEXT', content: '[TITLE]',
        style: { position: 'absolute', left: '6%', top: '8%', width: '88%', height: 'auto', fontSize: '32px', fontWeight: 'bold', color: '#111827', fontFamily: '"Inter", sans-serif' },
      },
      {
        type: 'TEXT', content: '[POINTS]',
        style: { position: 'absolute', left: '8%', top: '22%', width: '84%', height: 'auto', fontSize: '18px', color: '#374151', fontFamily: '"Inter", sans-serif', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
      },
    ],
    backgroundColor: '#f9fafb',
  },
  {
    name: 'Study - Q&A / Flashcard',
    type: 'study_qa',
    elements: [
      {
        type: 'TEXT', content: '[QUESTION]',
        style: { position: 'absolute', left: '6%', top: '20%', width: '88%', height: 'auto', fontSize: '28px', fontWeight: '600', color: '#111827', fontFamily: '"Inter", sans-serif', textAlign: 'center' },
      },
      {
        type: 'TEXT', content: '[ANSWER]',
        style: { position: 'absolute', left: '10%', top: '45%', width: '80%', height: 'auto', fontSize: '20px', color: '#374151', fontFamily: '"Georgia", serif', lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: 'center', backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' },
      },
    ],
    backgroundColor: '#ffffff',
  },
  {
    name: 'Study - Summary',
    type: 'study_summary',
    elements: [
      {
        type: 'TEXT', content: '[TITLE]',
        style: { position: 'absolute', left: '6%', top: '8%', width: '88%', height: 'auto', fontSize: '36px', fontWeight: 'bold', color: '#111827', fontFamily: '"Georgia", serif', textAlign: 'center' },
      },
      {
        type: 'TEXT', content: '[POINTS]',
        style: { position: 'absolute', left: '10%', top: '28%', width: '80%', height: 'auto', fontSize: '20px', color: '#374151', fontFamily: '"Inter", sans-serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
      },
    ],
    backgroundColor: '#f9fafb',
  },
  {
    name: 'Study - Sources',
    type: 'study_sources',
    elements: [
        { type: 'TEXT', content: 'Sources & Further Reading', style: { position: 'absolute', left: '6%', top: '8%', width: '88%', height: 'auto', fontSize: '32px', fontWeight: 'bold', color: '#111827', fontFamily: '"Inter", sans-serif' } },
        { type: 'TEXT', content: '[SOURCES]', style: { position: 'absolute', left: '8%', top: '22%', width: '84%', height: 'auto', fontSize: '16px', color: '#4b5563', fontFamily: '"Inter", sans-serif', lineHeight: 1.8, whiteSpace: 'pre-wrap', columns: 2 } },
    ],
    backgroundColor: '#ffffff',
  },
];
