import { v4 as uuidv4 } from 'uuid';
import { Slide, SlideTemplate, SlideElement, TextElement } from './types';
import { IMAGE_KEYWORD_MAP, EMOJI_KEYWORD_MAP } from './constants';

// Create a cache for memoizing text height calculations to improve performance.
const textHeightCache = new Map<string, number>();

// --- Color Contrast Utilities (based on WCAG guidelines) ---

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (lum1: number, lum2: number): number => {
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

// --- Layout & Sizing Utilities ---

const SLIDE_WIDTH_PX = 1280;
const SLIDE_HEIGHT_PX = 720;
const MIN_FONT_SIZE_PX = 12;
const MAX_FONT_SIZE_PX = 120;

/**
 * A "font dictionary" as requested, containing specific metrics for each font family.
 * `avgCharWidthRatio`: A tuned value representing the average character width relative to its font size.
 * `boldMultiplier`: A factor by which the width increases when the font is bold.
 */
const FONT_SPECIFIC_METRICS: Record<string, { avgCharWidthRatio: number; boldMultiplier: number }> = {
    '"Inter", sans-serif':           { avgCharWidthRatio: 0.52, boldMultiplier: 1.10 },
    'Arial, sans-serif':             { avgCharWidthRatio: 0.53, boldMultiplier: 1.15 },
    '"Lato", sans-serif':            { avgCharWidthRatio: 0.54, boldMultiplier: 1.10 },
    '"Montserrat", sans-serif':      { avgCharWidthRatio: 0.62, boldMultiplier: 1.20 },
    '"Roboto", sans-serif':          { avgCharWidthRatio: 0.55, boldMultiplier: 1.15 },
    '"Open Sans", sans-serif':       { avgCharWidthRatio: 0.56, boldMultiplier: 1.15 },
    'Georgia, serif':                { avgCharWidthRatio: 0.58, boldMultiplier: 1.10 },
    '"Times New Roman", serif':      { avgCharWidthRatio: 0.50, boldMultiplier: 1.05 },
    '"Playfair Display", serif':     { avgCharWidthRatio: 0.60, boldMultiplier: 1.15 },
};

/**
 * Maps thematic keywords to appropriate font families. This is the core of the new
 * heuristic-based font selection system.
 */
const FONT_THEME_KEYWORDS: Record<string, { keywords: string[], titleFonts: string[], bodyFonts: string[] }> = {
    professional: {
        keywords: ['business', 'corporate', 'report', 'analysis', 'strategy', 'finance', 'market', 'plan', 'agenda'],
        titleFonts: ['"Montserrat", sans-serif', '"Roboto", sans-serif'],
        bodyFonts: ['"Lato", sans-serif', '"Inter", sans-serif', '"Open Sans", sans-serif']
    },
    elegant: {
        keywords: ['history', 'art', 'culture', 'classic', 'literature', 'luxury', 'quote', 'author', 'poetry', 'fashion'],
        titleFonts: ['"Playfair Display", serif', 'Georgia, serif'],
        bodyFonts: ['Georgia, serif', '"Lato", sans-serif']
    },
    technical: {
        keywords: ['technology', 'software', 'data', 'science', 'engineering', 'code', 'network', 'future', 'innovation'],
        titleFonts: ['"Roboto", sans-serif', '"Inter", sans-serif'],
        bodyFonts: ['"Open Sans", sans-serif', '"Roboto", sans-serif']
    },
    creative: {
        keywords: ['creative', 'design', 'idea', 'inspiration', 'story', 'journey', 'welcome'],
        titleFonts: ['"Montserrat", sans-serif', '"Playfair Display", serif'],
        bodyFonts: ['"Lato", sans-serif', '"Inter", sans-serif']
    }
};

// Bounding box for layout calculations
interface BBox {
    id: string;
    x: number; y: number; w: number; h: number;
    originalElement: SlideElement;
}

const cssValueToPercent = (value: string | number | undefined, dimension: 'h' | 'w'): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    if (value.endsWith('%')) return parseFloat(value);
    if (value.endsWith('px')) {
        const px = parseFloat(value);
        return (px / (dimension === 'h' ? SLIDE_HEIGHT_PX : SLIDE_WIDTH_PX)) * 100;
    }
    return parseFloat(value) || 0;
};

/**
 * Estimates the rendered height of a text element using font-specific metrics and improved line-wrapping logic.
 * This is a more robust, educated calculation to prevent layout overlaps.
 * This function is memoized to avoid re-calculating for the same text element properties.
 */
const estimateTextHeightPercent = (element: TextElement): number => {
    const style = element.style;

    // Create a unique key for the cache based on relevant properties.
    const cacheKey = JSON.stringify({
        content: element.content,
        width: style.width,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
    });

    // Check if the result is already in the cache.
    if (textHeightCache.has(cacheKey)) {
        return textHeightCache.get(cacheKey)!;
    }

    // --- Original function logic with caching before each return ---

    if (!style.width || !style.fontSize) {
        textHeightCache.set(cacheKey, 2);
        return 2; // Default small height
    }

    const text = element.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, '');
    if (!text) {
        const result = cssValueToPercent(style.fontSize, 'h') * 1.4; // Height of one line for empty box
        textHeightCache.set(cacheKey, result);
        return result;
    }

    const widthPercent = cssValueToPercent(style.width, 'w');
    const fontSizePx = cssValueToPercent(style.fontSize, 'h') * SLIDE_HEIGHT_PX / 100;
    
    if (fontSizePx <= 0 || widthPercent <= 0) {
        textHeightCache.set(cacheKey, 2);
        return 2;
    }

    const lineHeight = typeof style.lineHeight === 'number' ? style.lineHeight : (typeof style.lineHeight === 'string' ? parseFloat(style.lineHeight) : 1.4);
    const isBold = style.fontWeight === 'bold' || style.fontWeight === 'bolder' || (typeof style.fontWeight === 'number' && style.fontWeight >= 600);
    const fontFamily = style.fontFamily || '"Inter", sans-serif';

    const fontMetrics = FONT_SPECIFIC_METRICS[fontFamily] || FONT_SPECIFIC_METRICS['"Inter", sans-serif'];
    let avgCharWidthRatio = fontMetrics.avgCharWidthRatio;
    if (isBold) {
        avgCharWidthRatio *= fontMetrics.boldMultiplier;
    }

    const avgCharWidthPx = fontSizePx * avgCharWidthRatio;
    const containerWidthPx = widthPercent * SLIDE_WIDTH_PX / 100;
    const charsPerLine = Math.floor(containerWidthPx / avgCharWidthPx);

    if (charsPerLine <= 0) {
        textHeightCache.set(cacheKey, 100);
        return 100;
    }

    const paragraphs = text.split('\n');
    let totalLines = 0;

    for (const paragraph of paragraphs) {
        if (paragraph.trim().length === 0) {
            totalLines += 1;
            continue;
        }

        const words = paragraph.split(' ').filter(w => w.length > 0);
        if (words.length === 0) {
            totalLines += 1;
            continue;
        }

        let currentLineLength = -1;
        for (const word of words) {
            if (word.length > charsPerLine) {
                if (currentLineLength > -1) totalLines++;
                totalLines += Math.ceil(word.length / charsPerLine);
                currentLineLength = -1;
                continue;
            }

            if (currentLineLength + word.length + 1 > charsPerLine) {
                totalLines++;
                currentLineLength = word.length;
            } else {
                currentLineLength = currentLineLength === -1 ? word.length : currentLineLength + word.length + 1;
            }
        }
        if (currentLineLength > -1) {
            totalLines++;
        }
    }
    
    if (totalLines === 0 && text.length > 0) totalLines = 1;
    
    const estimatedHeightPx = totalLines * fontSizePx * lineHeight;
    const result = (estimatedHeightPx / SLIDE_HEIGHT_PX) * 100;
    
    // Store the result in the cache before returning.
    textHeightCache.set(cacheKey, result);

    return result;
};


const elementToBBox = (element: SlideElement): BBox => {
    const style = element.style;
    let h = cssValueToPercent(style.height, 'h');
    if (element.type === 'TEXT' && (style.height === 'auto' || !style.height)) {
        h = estimateTextHeightPercent(element as TextElement);
    }
    return {
        id: element.id,
        x: cssValueToPercent(style.left, 'w'),
        y: cssValueToPercent(style.top, 'h'),
        w: cssValueToPercent(style.width, 'w'),
        h: h,
        originalElement: element,
    };
};

const findBestImageMatch = (keyword: string): string[] | undefined => {
    if (!keyword) return undefined;
    const cleanKeyword = keyword.toLowerCase().trim();
    if (IMAGE_KEYWORD_MAP[cleanKeyword]) return IMAGE_KEYWORD_MAP[cleanKeyword];

    const potentialKeys = Object.keys(IMAGE_KEYWORD_MAP);
    potentialKeys.sort((a, b) => b.length - a.length);

    for (const key of potentialKeys) {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(cleanKeyword)) return IMAGE_KEYWORD_MAP[key];
    }
    return undefined;
};

const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

const parseTextToHtml = (text: string): string => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
};

const adaptTemplateForContent = (template: SlideTemplate, aiSlideContent: any): SlideTemplate => {
    // Optimization: Replaced slow JSON.parse(JSON.stringify()) with a performant manual deep clone.
    const adaptedTemplate: SlideTemplate = {
        ...template,
        elements: template.elements.map(el => ({
            ...el,
            style: { ...el.style }
        }))
    };

    const { image_keyword } = aiSlideContent;

    if (adaptedTemplate.type === 'content_left_image' && !image_keyword) {
        adaptedTemplate.elements = adaptedTemplate.elements.filter((el: any) => el.type !== 'IMAGE');
        adaptedTemplate.elements.forEach((el: any) => {
            if (el.type === 'TEXT') {
                el.style.left = '8%';
                el.style.width = '84%';
                el.style.textAlign = 'center';
                const placeholder = el.content.match(/\[(.*?)\]/)?.[1]?.toLowerCase();
                if (placeholder === 'title') el.style.top = '20%';
                else if (placeholder === 'text') el.style.top = '40%';
            }
        });
    }
    return adaptedTemplate;
};

/**
 * The new evaluation function to select a font pair based on content.
 */
const selectFontPairForSlide = (aiSlideContent: any): { titleFont: string; bodyFont: string } => {
    const defaultFonts = { titleFont: '"Montserrat", sans-serif', bodyFont: '"Lato", sans-serif' };
    
    // Combine all text content for analysis
    const combinedText = [
        aiSlideContent.title,
        aiSlideContent.subtitle,
        aiSlideContent.text,
        ...(aiSlideContent.points || []),
    ].join(' ').toLowerCase();

    if (!combinedText.trim()) return defaultFonts;

    // Score themes based on keyword matches
    const themeScores: Record<string, number> = {};
    for (const [theme, data] of Object.entries(FONT_THEME_KEYWORDS)) {
        themeScores[theme] = 0;
        for (const keyword of data.keywords) {
            if (combinedText.includes(keyword)) {
                themeScores[theme]++;
            }
        }
    }

    const sortedThemes = Object.entries(themeScores).sort((a, b) => b[1] - a[1]);
    const winningTheme = sortedThemes[0][1] > 0 ? sortedThemes[0][0] : null;

    if (winningTheme) {
        const themeData = FONT_THEME_KEYWORDS[winningTheme];
        return {
            titleFont: themeData.titleFonts[0],
            bodyFont: themeData.bodyFonts[0],
        };
    }

    return defaultFonts;
};


const finalizeSlideLayout = (slide: Slide): Slide => {
    if (slide.elements.length <= 1) return slide;

    // Optimization: Replaced slow JSON.parse(JSON.stringify()) with a performant manual deep clone.
    const elements: SlideElement[] = slide.elements.map(el => ({
        ...el,
        style: { ...el.style }
    }));

    const bboxes = elements.map(elementToBBox);
    
    // Optimized layout adjustment using a discretized skyline (O(n*K) after sort)
    // This avoids the previous O(n^2) check by maintaining the "bottom" of the layout
    // in a fixed number of vertical columns. This is much more performant.
    const NUM_COLUMNS = 50; // Use more columns for better precision
    const PADDING_Y = 1.0;  // Vertical padding between elements in %
    const columnBottoms = new Array(NUM_COLUMNS).fill(0);

    bboxes.sort((a, b) => a.y - b.y);

    for (const box of bboxes) {
        // Determine the column range for the current element
        const startCol = Math.max(0, Math.floor(box.x / 100 * NUM_COLUMNS));
        // Use Math.min to prevent exceeding array bounds with elements at the far right edge.
        const endCol = Math.min(NUM_COLUMNS, Math.ceil((box.x + box.w) / 100 * NUM_COLUMNS));
        
        // Find the highest point reached by any element already placed in this horizontal range
        let placementY = 0;
        for (let c = startCol; c < endCol; c++) {
            placementY = Math.max(placementY, columnBottoms[c]);
        }

        // If the element's current position is obstructed, move it down
        if (box.y < placementY) {
            box.y = placementY + PADDING_Y;
        }
        
        // Update the skyline with the new bottom position of this element
        const newBottomY = box.y + box.h;
        for (let c = startCol; c < endCol; c++) {
            columnBottoms[c] = newBottomY;
        }
    }


    elements.forEach(el => {
        const box = bboxes.find(b => b.id === el.id);
        if (box) el.style.top = `${box.y.toFixed(2)}%`;
    });

    bboxes.forEach(box => {
        const element = elements.find(el => el.id === box.id);
        if (!element || element.type !== 'TEXT') return;

        const currentHeight = estimateTextHeightPercent(element as TextElement);
        if (box.y + currentHeight > 98) {
            const overflowRatio = (box.y + currentHeight) / 98;
            if (overflowRatio > 1) {
                const currentSizePx = cssValueToPercent(element.style.fontSize, 'h') * SLIDE_HEIGHT_PX / 100;
                let newSizePx = Math.floor(currentSizePx / Math.sqrt(overflowRatio));
                newSizePx = Math.max(newSizePx, MIN_FONT_SIZE_PX);
                element.style.fontSize = `${newSizePx}px`;
            }
        }
    });

    const backgroundRgb = hexToRgb(slide.backgroundColor);
    if (backgroundRgb) {
        const backgroundLuminance = getLuminance(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);
        const highContrastColor = backgroundLuminance > 0.5 ? '#000000' : '#FFFFFF';
        const WCAG_CONTRAST_THRESHOLD = 4.5;

        elements.forEach(element => {
            if (element.type === 'TEXT') {
                const textColor = element.style.color?.toString();
                if (textColor) {
                    const textRgb = hexToRgb(textColor);
                    if (textRgb) {
                        const textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
                        if (getContrastRatio(backgroundLuminance, textLuminance) < WCAG_CONTRAST_THRESHOLD) {
                            element.style.color = highContrastColor;
                        }
                    }
                }
                const finalSizePx = cssValueToPercent(element.style.fontSize, 'h') * SLIDE_HEIGHT_PX / 100;
                const clampedSize = Math.max(MIN_FONT_SIZE_PX, Math.min(finalSizePx, MAX_FONT_SIZE_PX));
                element.style.fontSize = `${Math.round(clampedSize)}px`;
            }
        });
    }

    return { ...slide, elements };
};

const determineStudySlideType = (aiSlideContent: any, index: number, totalSlides: number): string => {
    const { title, subtitle, text, points, question, answer, sources } = aiSlideContent;

    if (index === 0) return 'study_title';
    if (sources && sources.length > 0) return 'study_sources';
    if (title && title.toLowerCase().includes('summary') && index >= totalSlides - 2) return 'study_summary';
    if (question && answer) return 'study_qa';
    if (points && points.length > 0) return 'study_breakdown';
    if (text) return 'study_concept';
    
    return 'study_concept'; // Default fallback for study decks
};


const determineSlideType = (aiSlideContent: any, index: number, totalSlides: number, usedTypes: string[]): string => {
    const { title, subtitle, text, points, image_keyword, image_keyword_2, left_text, right_text, quote, author, statistic, description, points_left, points_right, column_1_title } = aiSlideContent;

    const scores: Record<string, number> = { 
        title: 0, title_image_background: 0, section_header: 0, agenda: 0, content_left_image: 0, 
        content_two_column: 0, quote: 0, statistic: 0, conclusion: 0, content_three_column: 0,
        content_image_bullets: 0, timeline: 0, content_comparison: 0, statement: 0, content_image_grid: 0
    };

    // --- 1. Strong Signals (Exclusive layouts) ---
    if (quote && author) scores.quote = 150;
    else if (quote) scores.statement = 150;
    if (statistic && (description || title)) scores.statistic = 150;
    if (column_1_title) scores.content_three_column = 160;
    if (points_left && points_right) scores.content_comparison = 160;
    if (image_keyword && image_keyword_2) scores.content_image_grid = 150;
    
    // --- 2. Positional & Keyword Signals ---
    const isFirst = index === 0;
    const isLast = index >= totalSlides - 2;
    const conclusionKeywords = ['thank you', 'q&a', 'questions', 'conclusion', 'summary', 'contact', 'next steps'];

    if (isFirst) {
        scores.title = 100;
        scores.title_image_background = image_keyword ? 120 : 80;
    }
    if (isLast && title && conclusionKeywords.some(kw => title.toLowerCase().includes(kw))) {
        scores.conclusion = 200;
    }

    // --- 3. Content-based Heuristics ---
    if (points && points.length > 1) {
        const isTimeline = points.some((p: string) => /\b(19|20)\d{2}\b|step\s*\d|phase\s*\d|day\s*\d/i.test(p));
        if (isTimeline) {
            scores.timeline = 140;
        } else {
            scores.agenda += 60;
            if (image_keyword) {
                scores.content_image_bullets = 85;
            }
        }
    }

    if (text) {
        if (left_text && right_text) {
             scores.content_two_column = 90;
        } else if (text.split(/\s+/).filter(Boolean).length > 50) {
             scores.content_two_column = 70;
             if (image_keyword) scores.content_left_image = 80;
        } else {
            if (image_keyword) scores.content_left_image = 90;
            else scores.agenda = 50;
        }
    }

    if (title && subtitle && !isFirst) {
        scores.section_header = 95;
    } else if (title && !points && !text && !quote && !statistic && !isFirst) {
        scores.section_header = 90;
    }

    // --- 4. Variety Penalty ---
    const lastType = usedTypes.length > 0 ? usedTypes[usedTypes.length - 1] : null;
    const secondLastType = usedTypes.length > 1 ? usedTypes[usedTypes.length - 2] : null;
    const genericTypes = ['agenda', 'content_left_image', 'content_two_column', 'content_image_bullets', 'section_header'];

    for (const type in scores) {
        let penalty = 1.0;
        if (type === lastType) penalty = 0.1;
        else if (type === secondLastType) penalty = 0.5;
        
        const lastThree = usedTypes.slice(-3);
        if (genericTypes.includes(type) && lastThree.length === 3 && lastThree.every(t => t === type)) {
            penalty = 0.05;
        }
        scores[type] *= penalty;
    }

    // --- 5. Selection ---
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const candidates = sortedScores.filter(s => s[1] > 0);

    let bestType: string;
    if (candidates.length === 0) {
        bestType = (points || text) ? 'agenda' : 'statement';
    } else {
        bestType = candidates[0][0];
    }
    
    if (index > 0 && (bestType === 'title' || bestType === 'title_image_background')) {
      return 'section_header';
    }

    return bestType;
};

export const generateSlidesFromAIResponse = (aiSlides: any[], templates: SlideTemplate[], isStudyDeck: boolean): Slide[] => {
    const newSlides: Slide[] = [];
    let usedTypes: string[] = [];
    aiSlides.forEach((aiSlideContent, index) => {
        const slideType = isStudyDeck
            ? determineStudySlideType(aiSlideContent, index, aiSlides.length)
            : determineSlideType(aiSlideContent, index, aiSlides.length, usedTypes);
        
        const isContentSlide = !['title', 'title_image_background', 'section_header', 'statement', 'conclusion', 'study_title'].includes(slideType);

        const hasBodyContent = aiSlideContent.text ||
                               (aiSlideContent.points && aiSlideContent.points.length > 0) ||
                               aiSlideContent.quote ||
                               aiSlideContent.statistic ||
                               (aiSlideContent.points_left && aiSlideContent.points_left.length > 0) ||
                               (aiSlideContent.points_right && aiSlideContent.points_right.length > 0) ||
                               aiSlideContent.column_1_text ||
                               aiSlideContent.description ||
                               aiSlideContent.answer ||
                               (aiSlideContent.sources && aiSlideContent.sources.length > 0);

        if (isContentSlide && !hasBodyContent) {
            console.warn(`Skipping slide creation for "${aiSlideContent.title || 'Untitled'}" because it lacks meaningful body content.`);
            return;
        }

        usedTypes.push(slideType);
        
        const originalTemplate = templates.find(t => t.type === slideType);
        if (!originalTemplate) { console.warn(`No template for type "${slideType}"`); return; }
        
        const template = adaptTemplateForContent(originalTemplate, aiSlideContent);
        const { titleFont, bodyFont } = selectFontPairForSlide(aiSlideContent);

        const slide: Slide = {
            id: generateId('slide'),
            backgroundColor: template.backgroundColor,
            elements: template.elements.map(templateElement => {
                const newElement = { ...templateElement, id: generateId('element') } as SlideElement;
                if (newElement.type === 'TEXT') {
                    let rawContent = '';
                    const placeholder = newElement.content.match(/\[(.*?)\]/)?.[1]?.toLowerCase();

                    const isTitleLike = placeholder === 'title' || placeholder?.includes('title') || placeholder === 'statistic' || placeholder === 'quote' || placeholder === 'subtitle' || placeholder === 'author' || placeholder === 'question';
                    newElement.style.fontFamily = isTitleLike ? titleFont : bodyFont;

                    if (placeholder) {
                        const arrayToPoints = (arr: string[], prefix = '• ') => Array.isArray(arr) ? arr.map(p => `${prefix}${p}`).join('\n') : '';

                        if (placeholder === 'points') rawContent = arrayToPoints(aiSlideContent.points);
                        else if (placeholder === 'sources') rawContent = arrayToPoints(aiSlideContent.sources, '');
                        else if (placeholder === 'points_left') rawContent = arrayToPoints(aiSlideContent.points_left, '✓ ');
                        else if (placeholder === 'points_right') rawContent = arrayToPoints(aiSlideContent.points_right, '✗ ');
                        else if (placeholder === 'text') {
                            if (aiSlideContent.text) rawContent = aiSlideContent.text;
                            else if (Array.isArray(aiSlideContent.points)) rawContent = aiSlideContent.points.join('\n');
                        } else if ((placeholder === 'left_text' || placeholder === 'right_text') && !aiSlideContent.left_text && !aiSlideContent.right_text && aiSlideContent.text) {
                            const paragraphs = aiSlideContent.text.split('\n').filter((p: string) => p.trim() !== '');
                            const midPoint = Math.ceil(paragraphs.length / 2);
                            rawContent = (placeholder === 'left_text') ? paragraphs.slice(0, midPoint).join('\n') : paragraphs.slice(midPoint).join('\n');
                        } else {
                            rawContent = aiSlideContent[placeholder] || newElement.content;
                        }
                    } else { rawContent = newElement.content; }
                    
                    rawContent = rawContent.replace(/\[emoji:\s*(\w+)\s*\]/g, (_, keyword) => EMOJI_KEYWORD_MAP[keyword.toLowerCase()] || '');
                    newElement.content = parseTextToHtml(rawContent);
                } else if (newElement.type === 'IMAGE') {
                    let imageKeyword = '';
                    if (newElement.src === '[IMAGE_URL]' || newElement.src === '[IMAGE_URL_1]') {
                        imageKeyword = aiSlideContent.image_keyword;
                    } else if (newElement.src === '[IMAGE_URL_2]') {
                        imageKeyword = aiSlideContent.image_keyword_2;
                    }
                    const images = findBestImageMatch(imageKeyword);
                    if (images?.length) {
                        newElement.src = images[Math.floor(Math.random() * images.length)];
                    }
                }
                return newElement;
            }).filter(el => {
                if (el.type === 'TEXT' && (el.content.includes('[') && el.content.includes(']') || el.content.replace(/<[^>]*>?/gm, '').trim() === '')) return false;
                if (el.type === 'IMAGE' && (el.src.includes('[') && el.src.includes(']'))) return false;
                return true;
            })
        };

        const finalizedSlide = finalizeSlideLayout(slide);
        newSlides.push(finalizedSlide);
    });
    return newSlides;
};
