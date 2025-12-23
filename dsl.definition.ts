
import { ChartType } from './types';

/**
 * Định nghĩa Domain-Specific Language (DSL) cho cấu trúc nội dung slide.
 */

export type LayoutType =
  | 'title' | 'title_image_background' | 'section_header' | 'statement' | 'content' 
  | 'content_with_table' | 'chart_focus'
  | 'two_column_text' | 'image_focus' | 'two_column_image'
  | 'content_two_column' | 'content_two_column_subheaded'
  | 'content_multi_column' | 'content_left_image' | 'content_right_image' | 'quote'
  | 'statistic' | 'content_comparison' | 'timeline' | 'process_flow' | 'team_showcase'
  | 'math_theorem_proof' | 'math_definition' | 'math_equation_centered'
  | 'math_equation_two_column' | 'math_graph_explanation' | 'conclusion'
  // Study deck layouts
  | 'study_title' | 'study_concept' | 'study_breakdown' | 'study_qa' | 'study_summary' | 'study_sources';

export interface ChartDataSpec {
  type: 'chart';
  chartType: ChartType;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface TableDataSpec {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ImagePromptSpec {
  type: 'image';
  prompt: string;
  style?: 'photo' | 'illustration' | 'diagram';
}

/**
 * Các loại nội dung có thể điền vào một "slot" của slide.
 * Updated: ChartDataSpec và TableDataSpec có thể là string (shorthand) từ AI trước khi được parse.
 */
export type SlotContent =
  | string
  | string[]
  | ChartDataSpec
  | TableDataSpec
  | ImagePromptSpec;

/**
 * Đặc tả cho một slide duy nhất.
 */
export interface AISlideSpec {
  layout: LayoutType;
  content: Record<string, SlotContent>;
}

/**
 * Đặc tả cho toàn bộ bài thuyết trình.
 */
export interface AIPresentationSpec {
  title?: string;
  slides: AISlideSpec[];
}
