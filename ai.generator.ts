
import { GoogleGenAI, Type } from '@google/genai';
import { SLIDE_LAYOUTS, STUDY_DECK_LAYOUTS } from './templates';
import { AIPresentationSpec, LayoutType } from './dsl.definition';
import { safeParse } from './json.repairer';
import { smartTruncate } from './utils';
import { validateAndRepairSlideSpec } from './ai.parser';

// Get available layout types dynamically to prevent hallucinations
const AVAILABLE_LAYOUT_IDS = [...SLIDE_LAYOUTS, ...STUDY_DECK_LAYOUTS].map(l => l.type);

// Priority list of models to try. If one fails, the next one is used automatically.
// 1. Gemini 3 Flash: Fast, smart, recommended for text.
// 2. Gemini 2.0 Flash Exp: Extremely stable and fast experimental channel.
// 3. Gemini 2.0 Pro Exp: High intelligence backup if Flash fails.
const MODELS_TO_TRY = [
    "gemini-3-flash-preview",
    "gemini-2.0-flash-exp",
    "gemini-2.0-pro-exp-02-05"
];

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
            },
            required: ["title"] // CRITICAL: Enforce at least title to prevent empty content objects
          }
        },
        required: ["layout", "content"]
      }
    }
  },
  required: ["slides"]
};

async function callGemini(ai: GoogleGenAI, topic: string, systemInstruction: string, minSlides: number, maxSlides: number, model: string) {
    return await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: `Tạo bài thuyết trình về chủ đề "${topic}" với khoảng ${minSlides} đến ${maxSlides} slide. Trả về JSON.` }] }],
        config: { 
            systemInstruction,
            responseMimeType: "application/json", 
            responseSchema: COMPACT_PRESENTATION_SCHEMA,
            temperature: 0.4, // Slightly higher for creativity in backup models
            thinkingConfig: model.includes("gemini-3") ? { thinkingBudget: 0 } : undefined // Only V3 supports thinking config param currently
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
    
    const layoutInstructions = layouts.map(l => `- "${l.type}": ${l.usageGuideline} (Slots: ${l.slots.join(', ')})`).join('\n');

    // Smart truncate to avoid token limits
    const truncatedContent = smartTruncate(fileContent, 15000); 

    const systemInstruction = `Bạn là chuyên gia thiết kế slide chuyên nghiệp.
Nhiệm vụ: Tạo bài thuyết trình về: "${topic}".
Văn bản: Tiếng Việt. Prompt ảnh: Tiếng Anh.

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
- **Toán học**: Dùng LaTeX trong $...$ (inline) hoặc $$...$$ (block).
  QUAN TRỌNG: Trong chuỗi JSON, bạn PHẢI escape dấu gạch chéo ngược (backslash).
  VD ĐÚNG: "Công thức $\\\\frac{a}{b}$" (sẽ thành \\frac khi parse)
  VD SAI: "Công thức $\\frac{a}{b}$" (sẽ lỗi JSON)

## 3. DỮ LIỆU NGUỒN
${truncatedContent}

## 4. YÊU CẦU
- Số slide: ${minSlides}-${maxSlides}.
- Đảm bảo JSON hợp lệ. Không được bịa ra layout không có trong danh sách trên.
- Đa dạng hóa layout, tránh dùng 'content' quá nhiều.`;

    let lastError: any = null;

    // Retry Strategy: Iterate through available models
    for (const model of MODELS_TO_TRY) {
        try {
            onProgress(`Đang kết nối với AI (${model})...`);
            
            const response = await callGemini(ai, topic, systemInstruction, minSlides, maxSlides, model);
            const spec = safeParse<AIPresentationSpec>(response.text, { version: '1.0', slides: [] });
            
            if (spec.slides && spec.slides.length > 0) {
                // CRITICAL FIX: Validate and repair slots immediately after parsing
                spec.slides = spec.slides.map(s => {
                    // 1. Normalize aliases (header->title, picture->image, etc.)
                    const repaired = validateAndRepairSlideSpec(s, s.layout as string, layouts);
                    
                    // 2. Validate Layout existence
                    if (!layouts.some(l => l.type === repaired.layout)) {
                        console.warn(`Invalid layout ${repaired.layout}, falling back to content`);
                        return { ...repaired, layout: 'content' as LayoutType };
                    }
                    return repaired;
                });
                
                onProgress(`Thành công! Đang tạo ${spec.slides.length} slide...`);
                return spec;
            }
        } catch (err: any) {
            console.warn(`Model ${model} thất bại:`, err);
            lastError = err;
            // If it's a billing/key error, stop immediately, don't retry other models as they will fail too
            if (err.message?.includes("API Key") || err.message?.includes("Billing")) {
                throw err;
            }
            // Otherwise, continue to the next model in the list
            onProgress(`Model ${model} phản hồi chậm, đang chuyển kênh dự phòng...`);
        }
    }

    // If all models fail
    if (lastError?.message?.includes("entity was not found")) {
        throw new Error("Lỗi API Key: Dự án Google Cloud của bạn chưa kích hoạt model này hoặc chưa bật Billing. Vui lòng chọn dự án khác.");
    }
    
    throw new Error("Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút hoặc chọn API Key khác.");
}
