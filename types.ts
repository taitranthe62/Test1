
import React from 'react';
import { Action } from './actions';
import { SlotContent, LayoutType } from './dsl.definition';

export type BaseElement = {
  id: string;
  slot?: string; 
  style: React.CSSProperties;
};

export type TextElement = BaseElement & {
  type: 'TEXT';
  content: string;
};

export type ImageElement = BaseElement & {
  type: 'IMAGE';
  src: string;
  prompt?: string;
};

export type ShapeType = 'RECTANGLE' | 'ELLIPSE';

export type ShapeElement = BaseElement & {
    type: 'SHAPE';
    shape: ShapeType;
};

export type IconElement = BaseElement & {
    type: 'ICON';
    iconName: string;
};

export type TableCell = {
  id: string;
  content: string;
  style: React.CSSProperties;
};

export type TableElement = BaseElement & {
  type: 'TABLE';
  rows: number;
  columns: number;
  cellData: TableCell[][];
};

export type ChartType = 'BAR' | 'PIE' | 'LINE';

export function normalizeChartType(input: any): ChartType {
    const type = String(input).toUpperCase();
    if (type === 'BAR' || type === 'PIE' || type === 'LINE') return type;
    return 'BAR'; 
}

export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[]; 
    borderColor?: string;   
  }[];
};

export type ChartElement = BaseElement & {
  type: 'CHART';
  chartType: ChartType;
  data: ChartData;
};

export type SlideElement = TextElement | ImageElement | ShapeElement | IconElement | TableElement | ChartElement;

export type BackgroundDefinition = {
  color: string; 
  primaryTextColor: string;   
  secondaryTextColor: string; 
  accentColor?: string;
  chartColors?: string[]; 
  pattern?: string; // Họa tiết SVG base64
};

export type Slide = {
  id: string;
  layout: LayoutType; 
  elements: SlideElement[];
  background: BackgroundDefinition;
};

export type SlideTemplate = {
  name: string;
  type: LayoutType; 
  slots: string[]; 
  priority: LayoutPriority;
  usageGuideline: string;
  previewElements: TemplateElement[];
  render: (
    content: Record<string, SlotContent>,
    theme: ThemePack,
    background: BackgroundDefinition,
    imageCache: Map<string, string>,
    slideKey: string
  ) => SlideElement[];
};

export type TemplateElement =
  | { type: 'TEXT'; content?: string; style: React.CSSProperties; channel?: string }
  | { type: 'IMAGE'; src: string; style: React.CSSProperties; channel?: string }
  | { type: 'SHAPE'; shape: ShapeType; style: React.CSSProperties; channel?: string }
  | { type: 'ICON'; iconName: string; style: React.CSSProperties; channel?: string }
  | { type: 'TABLE'; rows: number; columns: number; cellData: TableCell[][]; style: React.CSSProperties; channel?: string }
  | { type: 'CHART'; chartType: ChartType; data: { labels: string[], datasets: any[] }; style: React.CSSProperties; channel?: string };

export enum LayoutPriority {
  PRIMARY = 'primary',      
  SECONDARY = 'secondary',  
  TERTIARY = 'tertiary'     
}

export interface ThemePack {
  name: string;
  backgrounds: BackgroundDefinition[];
  titleFont: string;
  bodyFont: string;
  accentColor: string;
}

export interface PresentationState {
    version: number;
    slides: Slide[];
    currentSlideId: string | null;
    selectedElementId: string | null;
    currentSlide?: Slide;
    selectedElement?: SlideElement;
}

export { Action };
