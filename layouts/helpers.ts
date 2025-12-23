
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SlideElement, TextElement, ImageElement, TableElement, ChartElement, ThemePack, BackgroundDefinition, normalizeChartType } from '../types';
import { SlotContent, TableDataSpec, ChartDataSpec } from '../dsl.definition';
import { EMOJI_KEYWORD_MAP } from '../constants';

export const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

export const getContent = <T>(content: Record<string, SlotContent>, key: string, defaultValue: T): T => {
    const value = content[key] as T;
    // Debug logging for development
    if (value === undefined && process.env.NODE_ENV === 'development') {
        console.warn(`[Layout] Missing slot "${key}" in content. Available keys:`, Object.keys(content));
    }
    return value || defaultValue;
};

export const formatText = (text: string = ''): string => {
    if (typeof text !== 'string') return '';
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/g);
    return parts.map(part => {
        if (part.startsWith('$')) return part;
        return part
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[emoji:\s*(\w+)\s*\]/g, (_, keyword) => EMOJI_KEYWORD_MAP[keyword.toLowerCase()] || '');
    }).join('');
};

export const arrayToPoints = (arr: any, prefix = '• '): string => {
    if (!arr) return '';
    const items: string[] = Array.isArray(arr) ? arr : typeof arr === 'string' ? arr.split('\n') : [];
    return items
        .map(item => item.trim())
        .filter(item => item)
        .map(item => item.replace(/^(\*|-|•)\s*/, ''))
        .filter(item => item)
        .map(p => `${prefix}${formatText(p)}`)
        .join('<br />');
};

export const createTextElement = (id: string, slot: string, content: any, style: React.CSSProperties): TextElement | null => {
    const text = typeof content === 'string' ? content : '';
    const formattedContent = formatText(text);
    // Strict check: if formatted content is empty, return null so it's filtered out
    return formattedContent ? { id, slot, type: 'TEXT', content: formattedContent, style } : null;
};

export const createImageElement = (id: string, slot: string, content: any, imageCache: Map<string, string>, cacheKey: string, style: React.CSSProperties): ImageElement | TextElement | null => {
    const imageUrl = imageCache.get(cacheKey);
    const prompt = (content && typeof content === 'object' && 'prompt' in content) ? content.prompt : 'Visual concept';
    
    if (imageUrl) {
        return { id, slot, type: 'IMAGE', src: imageUrl, style, prompt };
    }
    
    // Fallback placeholder if image generation failed or hasn't run
    return {
        id, slot, type: 'TEXT',
        content: `<div style="opacity: 0.15; font-size: 80px; margin-bottom: 20px;">🖼️</div><div style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Visual Element</div><div style="font-style: italic; font-size: 0.8em; margin-top: 10px;">"${prompt}"</div>`,
        style: {
            ...style, 
            border: '1px solid #e2e8f0', 
            backgroundColor: '#f8fafc', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px', 
            textAlign: 'center',
            color: '#64748b',
            overflowWrap: 'break-word',
            borderRadius: '12px',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
        }
    };
};

export const createTableElement = (id: string, slot: string, content: any, style: React.CSSProperties): TableElement | null => {
    if (!content || (typeof content === 'object' && 'type' in content && content.type !== 'table') || !content.headers || !content.rows) return null;
    const { headers, rows } = content as TableDataSpec;
    const combinedData = [headers, ...rows];
    const maxCols = Math.max(...combinedData.map(r => (r || []).length));
    if (maxCols === 0) return null;

    return {
        id, slot, type: 'TABLE',
        rows: combinedData.length,
        columns: maxCols,
        style,
        cellData: combinedData.map((row: string[], rIndex: number) => {
            const newRow = (row || []).map((cell: string) => ({ id: generateId('cell'), content: formatText(cell), style: { fontWeight: rIndex === 0 ? 'bold' : 'normal' } }));
            while (newRow.length < maxCols) newRow.push({ id: generateId('cell'), content: '', style: { fontWeight: rIndex === 0 ? 'bold' : 'normal' } });
            return newRow;
        }),
    };
};

export const createChartElement = (id: string, slot: string, content: any, style: React.CSSProperties, background: BackgroundDefinition): ChartElement | null => {
    if (!content || (typeof content === 'object' && 'type' in content && content.type !== 'chart') || !content.chartType || !content.labels || !content.datasets) return null;
    const { chartType, labels, datasets } = content as ChartDataSpec;
    const colors = background.chartColors || ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#6366f1', '#a855f7'];

    const normalizedType = normalizeChartType(chartType);

    return {
        id, slot, type: 'CHART',
        chartType: normalizedType,
        style,
        data: {
            labels: labels,
            datasets: datasets.map((ds: any, i: number) => ({
                label: ds.label, data: ds.data,
                backgroundColor: normalizedType === 'PIE' ? labels.map((_: any, labelIndex: number) => colors[labelIndex % colors.length]) : [colors[i % colors.length]],
                borderColor: colors[i % colors.length],
            }))
        }
    };
};
