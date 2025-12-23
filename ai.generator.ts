
import { GoogleGenAI, Type } from '@google/genai';
import { SLIDE_LAYOUTS, STUDY_DECK_LAYOUTS } from './templates';
import { AIPresentationSpec, LayoutType } from './dsl.definition';
import { safeParse } from './json.repairer';
import { smartTruncate } from './utils';

// Get available layout types dynamically to prevent hallucinations
const AVAILABLE_LAYOUT_IDS = [...SLIDE_LAYOUTS, ...STUDY_DECK_LAYOUTS].map(l => l.type);

const COMPACT_PRESENTATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          layout: { 
              type: Type.STRING, 
              enum: AVAILABLE_LAYOUT_IDS // Strict Enum Validation
          },
          content: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              text: { type: Type.STRING },
              caption: { type: Type.STRING }, // Used for Quote Author as well
              points: { type: Type.ARRAY, items: { type: Type.STRING } },
              left_text: { type: Type.ARRAY, items: { type: Type.STRING } },
              right_text: { type: Type.ARRAY, items: { type: Type.STRING } },
              image: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["image"] },
                  prompt: { type: Type.STRING }
                },
                required: ["type", "prompt"]
              },
              table: { type: Type.STRING },
              chart: { type: Type.STRING }
            }
          }
        },
        required: ["layout", "content"]
      }
    }
  },
  required: ["slides"]
};

async function callGemini(ai: GoogleGenAI, topic: string, systemInstruction: string, minSlides: number, maxSlides: number) {
    return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Tạo bài thuyết trình về chủ đề "${topic}" với khoảng ${minSlides} đến ${maxSlides} slide. Trả về JSON.` }] }],
        config: { 
            systemInstruction,
            responseMimeType: "application/json", 
            responseSchema: COMPACT_PRESENTATION_SCHEMA,
            temperature: 0.3, // Lower temperature for structured data consistency
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
}

export async function generatePresentationFromTopic(
    topic: string, 
    fileContent: string, 
    minSlides: number,
    maxSlides: number,
    isStudyDeck: boolean,
    onProgress: (message: string) => void
): Promise<AIPresentationSpec> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const layouts = isStudyDeck ? STUDY_DECK_LAYOUTS : SLIDE_LAYOUTS;
    
    // Create a rich text description of available layouts
    const layoutInstructions = layouts.map(l => `- "${l.type}": ${l.usageGuideline} (Slots: ${l.slots.join(', ')})`).join('\n');

    onProgress(`Đang phân tích dữ liệu (DSL v2 Enhanced)...`);

    // Smart truncate to avoid token limits while keeping context
    const truncatedContent = smartTruncate(fileContent, 6000);

    const systemInstruction = `Bạn là chuyên gia thiết kế slide chuyên nghiệp.
Nhiệm vụ: Tạo bài thuyết trình về: "${topic}".
Văn bản: Tiếng Việt. Prompt ảnh: Tiếng Anh.
Toán học: Dùng LaTeX ($...$ hoặc $$...$$).

## 1. CẤU TRÚC LAYOUT (CHỈ ĐƯỢC DÙNG CÁC LOẠI SAU)
${layoutInstructions}

## 2. QUY ĐỊNH DỮ LIỆU
- **Chart**: Dùng chuỗi "LOẠI|NhãnX1,NhãnX2|DS1:1,2". LOẠI chỉ được là: BAR, LINE, PIE. 
  VD: "BAR|Q1,Q2|Rev:100,200". Dữ liệu phải khớp số lượng nhãn.
- **Table**: Dùng Markdown Table. VD: "| H1 | H2 |\\n| D1 | D2 |".
- **Image**: { "type": "image", "prompt": "mô tả chi tiết bằng tiếng Anh" }.
- **Quote**: Dùng layout 'quote'. Nội dung vào 'text', tác giả vào 'caption'.
- **Statistic**: Dùng layout 'statistic'. Số liệu vào 'text', mô tả vào 'subtitle'.
- **Timeline**: Dùng layout 'timeline'. Các mốc thời gian vào 'points'.

## 3. DỮ LIỆU NGUỒN
${truncatedContent}

## 4. YÊU CẦU
- Số slide: ${minSlides}-${maxSlides}.
- Đảm bảo JSON hợp lệ. Không được bịa ra layout không có trong danh sách trên.
- Đa dạng hóa layout, tránh dùng 'content' quá nhiều.`;

    let attempt = 0;
    const maxAttempts = 3; // Increased attempts

    while (attempt < maxAttempts) {
        try {
            if (attempt > 0) onProgress(`Máy chủ bận, đang thử lại lần ${attempt + 1}...`);
            
            const response = await callGemini(ai, topic, systemInstruction, minSlides, maxSlides);
            const spec = safeParse<AIPresentationSpec>(response.text, { slides: [] });
            
            if (spec.slides && spec.slides.length > 0) {
                // Double check layout validity
                spec.slides = spec.slides.map(s => {
                    if (!layouts.some(l => l.type === s.layout)) {
                        console.warn(`Invalid layout ${s.layout}, falling back to content`);
                        return { ...s, layout: 'content' as LayoutType };
                    }
                    return s;
                });
                
                onProgress(`Đã soạn thảo thành công ${spec.slides.length} slide.`);
                return spec;
            }
            throw new Error("Dữ liệu trả về trống.");
            
        } catch (err: any) {
            attempt++;
            console.warn(`Lần thử ${attempt} thất bại:`, err);
            
            if (attempt >= maxAttempts) {
                if (err.message?.includes("entity was not found")) {
                    throw new Error("Lỗi API Key: Vui lòng kiểm tra lại cấu hình Billing hoặc Key.");
                }
                throw new Error("Không thể kết nối với AI sau nhiều lần thử. Hãy thử rút ngắn nội dung yêu cầu.");
            }
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error("Lỗi không xác định.");
}
