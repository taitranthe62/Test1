
import { Slide, SlideElement, TableElement, ChartElement, TextElement, ImageElement } from './types';
import { AIPresentationSpec, AISlideSpec, SlotContent, TableDataSpec, ChartDataSpec, ImagePromptSpec } from './dsl.definition';

/**
 * Chuyển đổi một phần tử slide ngược lại thành nội dung DSL.
 */
function elementToSlotContent(element: SlideElement): SlotContent | undefined {
    if (!element.slot) return undefined;

    switch (element.type) {
        case 'TEXT':
            // Nếu là slot 'points', ta chuyển ngược từ HTML/Text có dấu đầu dòng sang mảng
            if (element.slot.includes('points') || element.slot.includes('list')) {
                const text = element.content.replace(/<br\s*\/?>/gi, '\n').replace(/•\s*/g, '');
                return text.split('\n').map(s => s.trim()).filter(Boolean);
            }
            return element.content.replace(/<br\s*\/?>/gi, '\n');

        case 'IMAGE':
            return {
                type: 'image',
                prompt: (element as ImageElement).prompt || 'Visual content',
                style: 'photo'
            } as ImagePromptSpec;

        case 'TABLE':
            const table = element as TableElement;
            const headers = table.cellData[0].map(c => c.content);
            const rows = table.cellData.slice(1).map(row => row.map(c => c.content));
            return {
                type: 'table',
                headers,
                rows
            } as TableDataSpec;

        case 'CHART':
            const chart = element as ChartElement;
            return {
                type: 'chart',
                chartType: chart.chartType.toLowerCase() as any,
                labels: chart.data.labels,
                datasets: chart.data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data
                }))
            } as ChartDataSpec;

        default:
            return undefined;
    }
}

/**
 * Chuyển đổi Slide UI sang Spec.
 */
export function serializeSlideToSpec(slide: Slide): AISlideSpec {
    const content: Record<string, SlotContent> = {};

    slide.elements.forEach(el => {
        if (el.slot) {
            const value = elementToSlotContent(el);
            if (value !== undefined) {
                content[el.slot] = value;
            }
        }
    });

    return {
        layout: slide.layout,
        content
    };
}

/**
 * Chuyển đổi toàn bộ Presentation sang Spec.
 */
export function serializePresentationToSpec(slides: Slide[]): AIPresentationSpec {
    return {
        slides: slides.map(serializeSlideToSpec)
    };
}
