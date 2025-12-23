
import { ThemePack } from '../types';
import { DOTS_PATTERN, GEOMETRIC_PATTERN, LINES_PATTERN } from '../patterns';

export const THEME_PACKS: ThemePack[] = [
  {
    name: 'Executive Blue',
    titleFont: '"Montserrat", sans-serif',
    bodyFont: '"Inter", sans-serif',
    accentColor: '#3b82f6',
    backgrounds: [
      { 
        color: 'linear-gradient(135deg, #1e3a8a, #1e40af)', 
        primaryTextColor: '#ffffff', 
        secondaryTextColor: '#bfdbfe',
        accentColor: '#60a5fa',
        pattern: DOTS_PATTERN,
        chartColors: ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff']
      },
      { 
        color: '#ffffff', 
        primaryTextColor: '#1e293b', 
        secondaryTextColor: '#64748b',
        accentColor: '#3b82f6',
        pattern: GEOMETRIC_PATTERN,
        chartColors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
      },
    ],
  },
  {
    name: 'Neo Mint',
    titleFont: '"Montserrat", sans-serif',
    bodyFont: '"Inter", sans-serif',
    accentColor: '#10b981',
    backgrounds: [
      { 
        color: '#064e3b', 
        primaryTextColor: '#ecfdf5', 
        secondaryTextColor: '#a7f3d0',
        accentColor: '#34d399',
        pattern: LINES_PATTERN,
        chartColors: ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5']
      },
      { 
        color: '#f8fafc', 
        primaryTextColor: '#064e3b', 
        secondaryTextColor: '#374151',
        accentColor: '#10b981',
        chartColors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      },
    ],
  },
  {
    name: 'Midnight Tech',
    titleFont: '"Roboto", sans-serif',
    bodyFont: '"Open Sans", sans-serif',
    accentColor: '#8b5cf6', // Violet
    backgrounds: [
      { 
        color: '#0f172a', // Slate 900
        primaryTextColor: '#f8fafc', 
        secondaryTextColor: '#94a3b8',
        accentColor: '#a78bfa',
        pattern: GEOMETRIC_PATTERN,
        chartColors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#ec4899']
      },
      { 
        color: '#1e293b', // Slate 800
        primaryTextColor: '#ffffff', 
        secondaryTextColor: '#cbd5e1',
        accentColor: '#8b5cf6',
        chartColors: ['#a78bfa', '#c4b5fd', '#8b5cf6', '#6366f1', '#f472b6']
      },
    ],
  }
];

export const STUDY_DECK_THEMES: ThemePack[] = [
  {
    name: 'Academic Paper',
    titleFont: '"Playfair Display", serif',
    bodyFont: '"Inter", sans-serif',
    accentColor: '#4f46e5',
    backgrounds: [ 
        { 
          color: '#fffcf2', 
          primaryTextColor: '#252422', 
          secondaryTextColor: '#403d39',
          accentColor: '#eb5e28',
          pattern: GEOMETRIC_PATTERN,
          chartColors: ['#eb5e28', '#ccc5b9', '#403d39', '#252422', '#fffcf2']
        }
    ],
  }
];
