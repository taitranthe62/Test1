import React from 'react';
import { Slide, SlideElement, BackgroundDefinition, SlideTemplate, ShapeType, ChartElement, TableCell } from './types';

// Action types as a const object for better type safety and autocompletion.
export const ActionTypes = {
  // Slide actions
  ADD_SLIDE: 'ADD_SLIDE',
  ADD_SLIDE_FROM_TEMPLATE: 'ADD_SLIDE_FROM_TEMPLATE',
  ADD_SLIDES_FROM_AI: 'ADD_SLIDES_FROM_AI',
  DELETE_SLIDE: 'DELETE_SLIDE',
  SELECT_SLIDE: 'SELECT_SLIDE',
  MOVE_SLIDE: 'MOVE_SLIDE',
  UPDATE_SLIDE_BACKGROUND: 'UPDATE_SLIDE_BACKGROUND',
  LOAD_SLIDES: 'LOAD_SLIDES',

  // Element actions
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  UPDATE_ELEMENT_STYLE: 'UPDATE_ELEMENT_STYLE',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  MOVE_ELEMENT_LAYER: 'MOVE_ELEMENT_LAYER',

  // Table-specific actions
  UPDATE_TABLE_CELL: 'UPDATE_TABLE_CELL',
  UPDATE_TABLE_DATA: 'UPDATE_TABLE_DATA',
  ADD_TABLE_ROW: 'ADD_TABLE_ROW',
  REMOVE_TABLE_ROW: 'REMOVE_TABLE_ROW',
  ADD_TABLE_COLUMN: 'ADD_TABLE_COLUMN',
  REMOVE_TABLE_COLUMN: 'REMOVE_TABLE_COLUMN',

  // Chart-specific actions
  UPDATE_CHART_DATA: 'UPDATE_CHART_DATA',
} as const;


// Type definitions for each action's payload, forming a discriminated union.
export type Action =
  // Slide actions
  | { type: typeof ActionTypes.ADD_SLIDE }
  | { type: typeof ActionTypes.ADD_SLIDE_FROM_TEMPLATE; payload: { template: SlideTemplate } }
  | { type: typeof ActionTypes.ADD_SLIDES_FROM_AI; payload: { newSlides: Slide[] } }
  | { type: typeof ActionTypes.DELETE_SLIDE; payload: { slideId: string } }
  | { type: typeof ActionTypes.SELECT_SLIDE; payload: { slideId: string | null } }
  | { type: typeof ActionTypes.MOVE_SLIDE; payload: { dragIndex: number; hoverIndex: number } }
  | { type: typeof ActionTypes.UPDATE_SLIDE_BACKGROUND; payload: { background: BackgroundDefinition } }
  | { type: typeof ActionTypes.LOAD_SLIDES; payload: { slides: any[] } } // 'any[]' to handle migration from old format
  
  // Element actions
  | { type: typeof ActionTypes.SELECT_ELEMENT; payload: { elementId: string | null } }
  | {
      type: typeof ActionTypes.ADD_ELEMENT;
      payload:
        | { type: 'TEXT' | 'SHAPE' | 'EMOJI' | 'CHART' }
        | { type: 'IMAGE'; options: { src: string } }
        | { type: 'ICON'; options: { iconName: string } }
        | { type: 'TABLE'; options: { rows: number; columns: number } };
    }
  | {
      type: typeof ActionTypes.UPDATE_ELEMENT;
      payload: { elementId: string; newContent?: string; newShape?: ShapeType; newIconName?: string };
    }
  // Fix: Use Partial<React.CSSProperties> to allow updating single style properties.
  | { type: typeof ActionTypes.UPDATE_ELEMENT_STYLE; payload: { elementId: string; newStyle: Partial<React.CSSProperties> } }
  | { type: typeof ActionTypes.DELETE_ELEMENT; payload: { elementId: string } }
  | { type: typeof ActionTypes.MOVE_ELEMENT_LAYER; payload: { elementId: string; direction: 'forward' | 'backward' } }

  // Table-specific actions
  | { type: typeof ActionTypes.UPDATE_TABLE_CELL; payload: { elementId: string; rowIndex: number; colIndex: number; newContent: string } }
  | { type: typeof ActionTypes.UPDATE_TABLE_DATA; payload: { elementId: string; rows: number; columns: number; cellData: TableCell[][] } }
  | { type: typeof ActionTypes.ADD_TABLE_ROW; payload: { elementId: string } }
  | { type: typeof ActionTypes.REMOVE_TABLE_ROW; payload: { elementId: string } }
  | { type: typeof ActionTypes.ADD_TABLE_COLUMN; payload: { elementId: string } }
  | { type: typeof ActionTypes.REMOVE_TABLE_COLUMN; payload: { elementId: string } }
  
  // Chart-specific actions
  | { type: typeof ActionTypes.UPDATE_CHART_DATA; payload: { elementId: string; newChartData: Partial<ChartElement> } };