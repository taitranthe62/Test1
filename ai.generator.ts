
import { GoogleGenAI, Type } from '@google/genai';
import { SLIDE_LAYOUTS, STUDY_DECK_LAYOUTS } from './templates';
import { AIPresentationSpec, LayoutType } from './dsl.definition';
import { safeParse } from './json.repairer';

// Optimized Schema: Uses Strings for complex types (Chart/Table) to save tokens
const COMPACT_PRESENTATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          layout: { type: Type.STRING },
          content: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              text: { type: Type.STRING },
              caption: { type: Type.STRING },
              points: { type: Type.ARRAY, items: { type: Type.STRING } },
              left_text: { type: Type.ARRAY, items: { type: Type.STRING } },
              right_text: { type: Type.ARRAY, items: { type: Type.STRING } },
              // Compact Image: just a prompt string or object
              image: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["image"] },
                  prompt: { type: Type.STRING }
                },
                required: ["type", "prompt"]
              },
              // Compact Table: Markdown string
              table: { type: Type.STRING },
              // Compact Chart: Pipe-separated string "TYPE|Label1,Label2|DS1:1,2"
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
            temperature: 0.7,
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
    const availableLayouts = layouts.map(l => l.type).join(', ');

    onProgress(`Đang phân tích dữ liệu (DSL v2 Compact)...`);

    const systemInstruction = `Bạn là chuyên gia thiết kế slide.
Nhiệm vụ: Tạo bài thuyết trình về: "${topic}".
Văn bản: Tiếng Việt. Prompt ảnh: Tiếng Anh.
Toán học: Dùng LaTeX ($...$ hoặc $$...$$).

## LUẬT FORMAT (COMPACT DSL)

### 1. Layouts:
${availableLayouts}

### 2. Chart Format (QUAN TRỌNG):
Trả về chuỗi String dạng: "LOẠI|NhãnX1,NhãnX2,...|TênDataset1:Số,Số...|TênDataset2:Số,Số..."
- LOẠI: BAR, LINE, PIE
- Ví dụ: "BAR|Q1,Q2,Q3|Doanh thu:100,200,150|Chi phí:80,120,90"

### 3. Table Format:
Trả về chuỗi String dạng Markdown Table chuẩn.
- Ví dụ: "| Header 1 | Header 2 |\\n| Data 1 | Data 2 |"

### 4. Image:
Trả về Object: { "type": "image", "prompt": "English description" }

## DỮ LIỆU NGUỒN
${fileContent.slice(0, 5000)}

## YÊU CẦU
- Số slide: ${minSlides}-${maxSlides}
- Trả về JSON hợp lệ khớp với Schema.`;

    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
        try {
            if (attempt > 0) onProgress(`Máy chủ bận, đang thử lại lần ${attempt}...`);
            
            const response = await callGemini(ai, topic, systemInstruction, minSlides, maxSlides);
            const spec = safeParse<AIPresentationSpec>(response.text, { slides: [] });
            
            if (spec.slides && spec.slides.length > 0) {
                // Filter invalid layouts
                spec.slides = spec.slides.filter(s => layouts.some(l => l.type === s.layout));
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
            // Đợi một chút trước khi thử lại
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    throw new Error("Lỗi không xác định.");
}
