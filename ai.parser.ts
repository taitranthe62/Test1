
import { AISlideSpec, LayoutType, SlotContent, ChartDataSpec, TableDataSpec } from './dsl.definition';
import { safeParse } from './json.repairer';
import { SlideTemplate, ChartType } from './types';

/**
 * Common aliases used by LLMs for standard slots.
 * Removed duplicates and added specific aliases for Quote/Stats.
 */
const SLOT_ALIASES: Record<string, string[]> = {
  title: ['header', 'heading', 'slide_title', 'main_title', 'subject'],
  subtitle: ['sub_header', 'subheading', 'intro'],
  points: ['bullets', 'list', 'content_points', 'items', 'bullet_points', 'text_list'],
  text: ['body', 'content_text', 'paragraph', 'description', 'main_body', 'quote_text'],
  left_text: ['column1', 'left_content', 'side_a'],
  right_text: ['column2', 'right_content', 'side_b'],
  image: ['picture', 'visual', 'graphic', 'photo', 'illustration'],
  background_image: ['bg_image', 'cover_image', 'hero_image'],
  caption: ['image_caption', 'subtext', 'label', 'author', 'source'], // Shared with quote author
  table: ['data_table', 'comparison_table', 'stats_table'],
  chart: ['graph', 'data_chart', 'visualization', 'plot']
};

/**
 * Parses "BAR|Label1,Label2|DS1:10,20" into ChartDataSpec
 */
function parseChartShorthand(input: string): ChartDataSpec {
  const fallback: ChartDataSpec = { type: 'chart', chartType: 'BAR', labels: ['No Data'], datasets: [{ label: 'Empty', data: [0] }] };
  
  if (!input || typeof input !== 'string') return fallback;
  
  const parts = input.split('|');
  if (parts.length < 3) return fallback;

  const rawType = parts[0].trim().toUpperCase();
  const chartType = (['BAR', 'LINE', 'PIE'].includes(rawType) ? rawType : 'BAR') as ChartType;
  
  const labels = parts[1].split(',').map(s => s.trim());
  const labelCount = labels.length;
  
  const datasets = parts.slice(2).map(ds => {
    const splitIndex = ds.indexOf(':');
    if (splitIndex === -1) return null;
    
    const label = ds.substring(0, splitIndex).trim();
    const dataStr = ds.substring(splitIndex + 1);
    
    // Improved number parsing
    let data = dataStr.split(',').map(n => {
       const parsed = parseFloat(n.trim());
       return isNaN(parsed) ? 0 : parsed;
    });

    // Validate data length matches labels
    if (data.length < labelCount) {
        // Pad with zeros
        data = [...data, ...Array(labelCount - data.length).fill(0)];
    } else if (data.length > labelCount) {
        // Slice to fit
        data = data.slice(0, labelCount);
    }

    return { label, data };
  }).filter((d): d is { label: string; data: number[] } => d !== null);

  if (datasets.length === 0) return fallback;

  return { type: 'chart', chartType, labels, datasets };
}

/**
 * Parses Markdown table string into TableDataSpec
 */
function parseTableMarkdown(input: string): TableDataSpec {
  const fallback: TableDataSpec = { type: 'table', headers: ['Header'], rows: [['Data']] };
  
  if (!input || typeof input !== 'string') return fallback;

  const lines = input.split('\n').map(l => l.trim()).filter(l => l && l.startsWith('|'));
  if (lines.length < 2) return fallback;

  const parseLine = (line: string) => {
      // Fix: Regex now correctly matches leading/trailing pipes without confusing escaped pipes
      const content = line.replace(/^\||\|$/g, ''); 
      return content.split('|').map(c => c.trim());
  };

  const headers = parseLine(lines[0]);
  
  // Skip separator line (e.g. |---|---|)
  const rows = lines.slice(1)
    .filter(l => !l.includes('---'))
    .map(parseLine);

  return { type: 'table', headers, rows };
}

/**
 * Validates and repairs a slide specification to ensure it adheres to a template.
 */
export function validateAndRepairSlideSpec(
  rawParsed: any,
  requestedLayout: string,
  templates: SlideTemplate[]
): AISlideSpec {
  // 1. Determine Layout
  let layoutName = (rawParsed.layout || rawParsed.slide_layout || rawParsed.slide_type || requestedLayout) as LayoutType;
  
  // Ensure layout exists in our library, fallback to 'content' if not
  let template = templates.find(t => t.type === layoutName);
  if (!template) {
    // Try to fuzzy match
    const fuzzyMatch = templates.find(t => t.type.includes(layoutName) || layoutName.includes(t.type));
    if (fuzzyMatch) {
        template = fuzzyMatch;
        layoutName = template.type;
    } else {
        layoutName = 'content' as LayoutType;
        template = templates.find(t => t.type === 'content')!;
    }
  }

  // 2. Extract Raw Content
  let rawContent = rawParsed.content || rawParsed.slots || rawParsed;
  if (typeof rawContent !== 'object' || rawContent === null) {
    rawContent = {};
  }

  // 3. Map and Validate Slots
  const repairedContent: Record<string, SlotContent> = {};
  const templateSlots = template.slots;

  templateSlots.forEach(slot => {
    // Check for exact match first
    let val = rawContent[slot];

    // Try aliases if not found
    if (val === undefined) {
      const aliases = SLOT_ALIASES[slot] || [];
      for (const alias of aliases) {
        if (rawContent[alias] !== undefined) {
          val = rawContent[alias];
          break;
        }
      }
    }

    // EXPAND COMPACT FORMATS
    if (slot === 'chart') {
      if (typeof val === 'string') {
        repairedContent[slot] = parseChartShorthand(val);
      } else if (typeof val === 'object' && val?.type === 'chart') {
        repairedContent[slot] = val; 
      } else {
        repairedContent[slot] = { type: 'chart', chartType: 'BAR', labels: [], datasets: [] };
      }
    } 
    else if (slot === 'table') {
      if (typeof val === 'string') {
        repairedContent[slot] = parseTableMarkdown(val);
      } else if (typeof val === 'object' && val?.type === 'table') {
        repairedContent[slot] = val; 
      } else {
        repairedContent[slot] = { type: 'table', headers: [], rows: [] };
      }
    }
    else if (slot === 'image' || slot === 'background_image') {
      if (typeof val === 'string') {
         repairedContent[slot] = { type: 'image', prompt: val };
      } else if (val && typeof val === 'object' && val.prompt) {
         repairedContent[slot] = { type: 'image', prompt: val.prompt };
      } else {
         repairedContent[slot] = { type: 'image', prompt: 'Visual representation of the slide topic' };
      }
    } 
    else if (slot.includes('points') || slot.includes('list')) {
      repairedContent[slot] = Array.isArray(val) ? val : (val ? [String(val)] : []);
    } 
    else {
      // Default text
      repairedContent[slot] = val ? String(val) : '';
    }
  });

  return {
    layout: layoutName,
    content: repairedContent
  };
}

/**
 * Validates and normalizes a single slide specification from AI.
 */
export function parseSlideSpec(rawJson: string, requestedLayout: string, templates: SlideTemplate[]): AISlideSpec {
  const parsed = safeParse<any>(rawJson, {});
  return validateAndRepairSlideSpec(parsed, requestedLayout, templates);
}

export interface OutlineItem {
  layout: string;
  title: string;
  focus: string;
}

export function parseOutline(rawJson: string): OutlineItem[] {
  const parsed = safeParse<any[]>(rawJson, []);
  
  const items = Array.isArray(parsed) 
    ? parsed 
    : (parsed && typeof parsed === 'object' && (parsed as any).slides) 
      ? (parsed as any).slides 
      : [];

  return (items as any[]).map(item => ({
    layout: String(item.layout || 'content'),
    title: String(item.title || 'Untitled Slide'),
    focus: String(item.focus || '')
  }));
}
