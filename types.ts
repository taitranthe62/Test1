// Fix: Added full content for types.ts to provide the core data structures for the application.
import React from 'react';

export type TextElement = {
  id: string;
  type: 'TEXT';
  content: string;
  style: React.CSSProperties;
};

export type ImageElement = {
  id: string;
  type: 'IMAGE';
  src: string;
  style: React.CSSProperties;
};

export type SlideElement = TextElement | ImageElement;

export type Slide = {
  id: string;
  elements: SlideElement[];
  backgroundColor: string;
};

export type TemplateElement = Omit<TextElement, 'id'> | Omit<ImageElement, 'id'>;

export type SlideTemplate = {
  name: string;
  type: string;
  elements: TemplateElement[];
  backgroundColor: string;
};