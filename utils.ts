// Fix: Import React to use React.CSSProperties type.
import React from 'react';
import { BackgroundDefinition } from './types';

/**
 * Converts a BackgroundDefinition object into a CSS-compatible background string.
 * This is crucial for components like the PDF exporter that need to apply the background
 * style to a single element.
 * @param bgDef The BackgroundDefinition object.
 * @returns A CSS string for the `background` property.
 */
export const backgroundDefToCss = (bgDef: BackgroundDefinition): { background: string, backgroundBlendMode: React.CSSProperties['backgroundBlendMode'] } => {
    if (!bgDef) return { background: '#ffffff', backgroundBlendMode: 'normal' };
    // Fix: Cast backgroundBlendMode to any to fix type error.
    return { background: bgDef.color, backgroundBlendMode: 'normal' as any };
};

/**
 * Converts a hex color string to an RGBA string.
 * @param hex The hex color (e.g., "#RRGGBB").
 * @param alpha The alpha transparency (0 to 1).
 * @returns The RGBA string.
 */
export function hexToRgba(hex: string, alpha: number): string {
    if (typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha || 1})`;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
}
