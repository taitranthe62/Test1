
import React from 'react';
import { BackgroundDefinition } from './types';

/**
 * Converts a BackgroundDefinition object into a CSS-compatible background string.
 */
export const backgroundDefToCss = (bgDef: BackgroundDefinition): { background: string, backgroundBlendMode: React.CSSProperties['backgroundBlendMode'] } => {
    if (!bgDef) return { background: '#ffffff', backgroundBlendMode: 'normal' };
    return { background: bgDef.color, backgroundBlendMode: 'normal' as any };
};

/**
 * Converts a hex color string to an RGBA string.
 */
export function hexToRgba(hex: string, alpha: number): string {
    if (typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha || 1})`;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
}

/**
 * Basic HTML sanitization to prevent XSS.
 * Removes script, iframe, object tags and event handlers.
 */
export const sanitizeHtml = (input: string): string => {
    if (!input) return "";
    return input
        .replace(/<script[^>]*?>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*?>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*?>.*?<\/object>/gi, '')
        .replace(/\s+on\w+="[^"]*"/gi, '')
        .replace(/\s+on\w+='[^']*'/gi, '')
        .replace(/\s+on\w+=[\w]+/gi, '')
        .replace(/javascript:/gi, '');
};

/**
 * Smartly truncates text to a limit, attempting to break at a sentence boundary.
 */
export const smartTruncate = (text: string, limit: number): string => {
    if (!text || text.length <= limit) return text || "";
    const truncated = text.slice(0, limit);
    // Try to find the last sentence ending (.!?)
    const lastPunctuation = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? ')
    );
    
    // If found and it's within the last 20% of the limit, cut there
    if (lastPunctuation > limit * 0.8) {
        return truncated.slice(0, lastPunctuation + 1);
    }
    
    // Fallback to space
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > limit * 0.8) {
        return truncated.slice(0, lastSpace) + "...";
    }

    return truncated + "...";
};
