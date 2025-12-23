
import { v4 as uuidv4 } from 'uuid';
import { Slide, SlideTemplate, ThemePack, SlideElement } from './types';
import { GoogleGenAI } from '@google/genai';
import { SLIDE_LAYOUTS, STUDY_DECK_LAYOUTS } from './templates';
import { AIPresentationSpec, ImagePromptSpec } from './dsl.definition';

const MAX_AI_IMAGES = 4;
const IMAGE_GEN_RETRIES = 1;

async function generateImageWithRetry(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    for (let attempt = 1; attempt <= IMAGE_GEN_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image', 
                contents: {
                    parts: [{ text: `Digital artistic slide illustration for: ${prompt}. Professional, high resolution, minimalist.` }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9"
                    }
                }
            });

            const candidate = response.candidates?.[0];
            if (!candidate) throw new Error("No candidate found");

            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("No image in response.");
        } catch (error: any) {
            console.warn(`Lỗi tạo ảnh:`, error);
            if (attempt === IMAGE_GEN_RETRIES) throw error;
        }
    }
    throw new Error("Generation failed.");
}

function selectSmartTheme(topic: string, themePacks: ThemePack[]): ThemePack {
    if (!themePacks || themePacks.length === 0) {
        throw new Error("No theme packs available");
    }
    
    // Default to the first one (Executive Blue) for professional consistency
    let selectedTheme = themePacks[0]; 

    const lowerTopic = (topic || '').toLowerCase();

    // Heuristic keyword matching
    if (lowerTopic.match(/nature|environment|green|plant|eco|forest|growth|health|organic/)) {
        const greenTheme = themePacks.find(t => t.name === 'Neo Mint');
        if (greenTheme) selectedTheme = greenTheme;
    } else if (lowerTopic.match(/history|art|culture|classic|paper|book|study|literature/)) {
        const paperTheme = themePacks.find(t => t.name === 'Academic Paper');
        if (paperTheme) selectedTheme = paperTheme;
    } 
    // Add more conditions as themes are added

    return selectedTheme;
}

export const generateSlidesFromSpecification = async (
    spec: AIPresentationSpec,
    themePacks: ThemePack[],
    isStudyDeck: boolean,
    onProgress: (message: string) => void,
    skipImages: boolean = false
): Promise<Slide[]> => {
    onProgress('Đang thiết lập chủ đề...');
    
    // SMART THEME SELECTION instead of Random
    const topic = spec.title || "Presentation";
    const chosenTheme = selectSmartTheme(topic, themePacks);
    
    const layouts = isStudyDeck ? STUDY_DECK_LAYOUTS : SLIDE_LAYOUTS;
    
    const imageCache = new Map<string, string>();

    if (!skipImages) {
        const imageRequestQueue = new Map<string, ImagePromptSpec>();
        spec.slides.forEach((slideSpec, slideIndex) => {
            Object.entries(slideSpec.content).forEach(([slotName, content]) => {
                if (content && typeof content === 'object' && 'type' in content && content.type === 'image') {
                    const key = `slide-${slideIndex}-${slotName}`;
                    if (imageRequestQueue.size < MAX_AI_IMAGES) {
                        imageRequestQueue.set(key, content as ImagePromptSpec);
                    }
                }
            });
        });

        if (imageRequestQueue.size > 0) {
            onProgress(`Đang minh họa slide bằng AI Flash Image...`);
            const generationPromises = Array.from(imageRequestQueue.entries()).map(async ([key, imagePrompt]) => {
                try {
                    const imageUrl = await generateImageWithRetry(imagePrompt.prompt);
                    imageCache.set(key, imageUrl);
                } catch (error) {
                    console.error(`Bỏ qua ảnh lỗi:`, error);
                }
            });
            await Promise.all(generationPromises);
        }
    }

    onProgress('Hoàn tất bố cục...');
    const finalSlides: Slide[] = spec.slides.map((slideSpec, index) => {
        const layoutTemplate = layouts.find(t => t.type === slideSpec.layout);
        if (!layoutTemplate) return null;
        
        const background = chosenTheme.backgrounds[index % chosenTheme.backgrounds.length];
        const slideKey = `slide-${uuidv4()}`;
        
        const slideImageCache = new Map<string, string>();
        Object.keys(slideSpec.content).forEach(slotName => {
            const cacheKey = `slide-${index}-${slotName}`;
            if (imageCache.has(cacheKey)) {
                slideImageCache.set(`slide-${slideKey}-${slotName}`, imageCache.get(cacheKey)!);
            }
        });

        const elements = layoutTemplate.render(slideSpec.content, chosenTheme, background, slideImageCache, slideKey);
        
        return { 
            id: slideKey, 
            layout: slideSpec.layout,
            elements: elements.filter(Boolean), 
            background 
        };
    }).filter((s): s is Slide => s !== null);
    
    return finalSlides;
};
