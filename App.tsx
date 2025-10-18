import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './components/Toolbar';
import SlidePreviewPanel from './components/SlidePreviewPanel';
import EditorPanel from './components/EditorPanel';
import PresentationView from './components/PresentationView';
import TemplateGallery from './components/TemplateGallery';
import LatexGuide from './components/LatexGuide';
import AIGenerationModal, { DetailLevel } from './components/AIGenerationModal';
import AILoadingModal from './components/AILoadingModal';
import { Slide, SlideElement, TextElement, ImageElement, TemplateElement, SlideTemplate } from './types';
import { SLIDE_TEMPLATES, STUDY_DECK_TEMPLATES } from './templates';
import { preprocessImageForOCR, repairJsonWithLatex } from './utils';
import { generateSlidesFromAIResponse } from './slideGenerator';
import { IMAGE_KEYWORD_MAP } from './constants';

const initialSlide: Slide = {
  id: 'slide-initial',
  elements: [
    {
      type: 'TEXT',
      id: 'element-title',
      content: 'Welcome to Your Presentation!',
      style: {
        position: 'absolute', left: '10%', top: '35%', width: '80%', height: 'auto',
        fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif',
      },
    },
    {
      type: 'TEXT',
      id: 'element-subtitle',
      content: 'Use the toolbar above to get started.',
      style: {
        position: 'absolute', left: '10%', top: '55%', width: '80%', height: 'auto',
        fontSize: '24px', textAlign: 'center', color: '#555555', fontFamily: '"Lato", sans-serif',
      },
    },
  ],
  backgroundColor: '#fdfdfd',
};

// Helper to generate a unique ID
const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([initialSlide]);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(initialSlide.id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // UI State
  const [isViewingPresentation, setIsViewingPresentation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLatexGuide, setShowLatexGuide] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);
  const [aiLoadingState, setAiLoadingState] = useState<{ status: 'idle' | 'loading' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [isDownloading, setIsDownloading] = useState(false);

  // Select the current slide object based on the ID
  const currentSlide = slides.find(s => s.id === currentSlideId);

  // Deselect element if slide changes
  useEffect(() => {
    setSelectedElementId(null);
  }, [currentSlideId]);

  // Load from local storage on mount
  useEffect(() => {
    const savedSlides = localStorage.getItem('presentationSlides');
    if (savedSlides) {
      try {
        const parsedSlides = JSON.parse(savedSlides) as Slide[];
        if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
          setSlides(parsedSlides);
          setCurrentSlideId(parsedSlides[0].id);
        }
      } catch (e) {
        console.error("Failed to parse slides from localStorage", e);
      }
    }
  }, []);
  
  // --- Slide Handlers ---
  const handleAddSlide = useCallback(() => {
    const newSlide: Slide = { id: generateId('slide'), elements: [], backgroundColor: '#ffffff' };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideId(newSlide.id);
  }, []);

  const handleAddSlideFromTemplate = useCallback((template: SlideTemplate) => {
    const newSlide: Slide = {
      id: generateId('slide'),
      backgroundColor: template.backgroundColor,
      elements: template.elements.map((el: TemplateElement) => ({
        ...el,
        id: generateId('element'),
      })) as SlideElement[],
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideId(newSlide.id);
    setShowTemplates(false);
  }, []);

  const handleDeleteSlide = useCallback((id: string) => {
    setSlides(prev => {
      const newSlides = prev.filter(s => s.id !== id);
      if (currentSlideId === id) {
        setCurrentSlideId(newSlides.length > 0 ? newSlides[0].id : null);
      }
      return newSlides;
    });
  }, [currentSlideId]);

  const handleSelectSlide = useCallback((id: string) => {
    setCurrentSlideId(id);
  }, []);

  const handleMoveSlide = useCallback((dragIndex: number, hoverIndex: number) => {
    setSlides(prev => {
      const newSlides = [...prev];
      const [draggedItem] = newSlides.splice(dragIndex, 1);
      newSlides.splice(hoverIndex, 0, draggedItem);
      return newSlides;
    });
  }, []);

  const handleUpdateSlideBackground = useCallback((color: string) => {
    if (!currentSlideId) return;
    setSlides(slides.map(s => s.id === currentSlideId ? { ...s, backgroundColor: color } : s));
  }, [currentSlideId, slides]);
  
  // --- Element Handlers ---
  const handleAddElement = useCallback((type: 'TEXT' | 'IMAGE' | 'EMOJI') => {
    if (!currentSlideId) return;

    let newElement: SlideElement;
    if (type === 'TEXT' || type === 'EMOJI') {
      newElement = {
        id: generateId('element'),
        type: 'TEXT',
        content: type === 'EMOJI' ? '😀' : 'New Text',
        style: {
          position: 'absolute', left: '40%', top: '40%', width: type === 'EMOJI' ? '10%' : '20%', height: 'auto',
          fontSize: type === 'EMOJI' ? '80px' : '24px', textAlign: 'center'
        },
      } as TextElement;
    } else { // IMAGE
      setShowImageGallery(true);
      return; // Handled by onImageSelect
    }

    setSlides(slides.map(s => s.id === currentSlideId ? { ...s, elements: [...s.elements, newElement] } : s));
    setSelectedElementId(newElement.id);
  }, [currentSlideId, slides]);
  
  const handleImageSelectedFromGallery = (src: string) => {
     if (!currentSlideId) return;
     const newElement: ImageElement = {
        id: generateId('element'),
        type: 'IMAGE',
        src: src,
        style: {
            position: 'absolute', left: '35%', top: '30%', width: '30%', height: '40%', objectFit: 'cover'
        }
     };
     setSlides(slides.map(s => s.id === currentSlideId ? { ...s, elements: [...s.elements, newElement] } : s));
     setSelectedElementId(newElement.id);
     setShowImageGallery(false);
  }

  const handleUpdateElement = useCallback((id: string, newElement: Partial<SlideElement>) => {
    if (!currentSlideId) return;
    setSlides(slides.map(s => s.id === currentSlideId
      ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, ...newElement } as SlideElement : e) }
      : s));
  }, [currentSlideId, slides]);

  const handleUpdateElementStyle = useCallback((id: string, newStyle: React.CSSProperties) => {
     if (!currentSlideId) return;
     setSlides(slides.map(s => s.id === currentSlideId
       ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, style: { ...e.style, ...newStyle } } : e) }
       : s));
  }, [currentSlideId, slides]);

  const handleDeleteElement = useCallback((id: string) => {
    if (!currentSlideId) return;
    setSlides(slides.map(s => s.id === currentSlideId
      ? { ...s, elements: s.elements.filter(e => e.id !== id) }
      : s));
    setSelectedElementId(null);
  }, [currentSlideId, slides]);
  
  const handleMoveElementLayer = useCallback((id: string, direction: 'forward' | 'backward') => {
      if (!currentSlide) return;
      const elements = [...currentSlide.elements];
      const index = elements.findIndex(e => e.id === id);
      if (index === -1) return;

      if (direction === 'forward' && index < elements.length - 1) {
          [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
      } else if (direction === 'backward' && index > 0) {
          [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
      } else {
          return; // No change needed
      }

      setSlides(slides.map(s => s.id === currentSlideId ? { ...s, elements } : s));
  }, [currentSlide, currentSlideId, slides]);

  // --- Presentation & UI Handlers ---
  const handlePresent = () => setIsViewingPresentation(true);
  const handleSave = () => {
      localStorage.setItem('presentationSlides', JSON.stringify(slides));
      alert('Presentation saved!');
  };
  const handleLoad = () => {
      const savedSlides = localStorage.getItem('presentationSlides');
      if (savedSlides) {
        try {
          const parsedSlides = JSON.parse(savedSlides) as Slide[];
          setSlides(parsedSlides);
          setCurrentSlideId(parsedSlides[0]?.id || null);
          alert('Presentation loaded!');
        } catch (e) {
          console.error("Failed to parse slides from localStorage", e);
          alert('Could not load presentation. Data might be corrupted.');
        }
      } else {
        alert('No saved presentation found.');
      }
  };
  
    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        setAiLoadingState({ status: 'loading', message: 'Preparing presentation for download...' });

        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1280, 720],
                hotfixes: ['px_scaling'],
            });

            const renderContainer = document.createElement('div');
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.top = '-9999px';
            renderContainer.style.width = '1280px';
            renderContainer.style.height = '720px';
            document.body.appendChild(renderContainer);

            const cssPropertiesToString = (style: React.CSSProperties | undefined): string => {
                if (!style) return '';
                return Object.entries(style)
                    .map(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            const cssKey = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
                            return `${cssKey}: ${value}`;
                        }
                        return '';
                    })
                    .filter(Boolean)
                    .join('; ');
            };
            
            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                setAiLoadingState({ status: 'loading', message: `Processing slide ${i + 1} of ${slides.length}...` });

                let slideContentHtml = '';
                for (const element of slide.elements) {
                    if (element.type === 'TEXT') {
                        const containerStyleObj = { ...element.style };
                        const textStyleObj: React.CSSProperties = {
                            fontFamily: containerStyleObj.fontFamily, fontSize: containerStyleObj.fontSize,
                            fontWeight: containerStyleObj.fontWeight, fontStyle: containerStyleObj.fontStyle,
                            textDecoration: containerStyleObj.textDecoration, textAlign: containerStyleObj.textAlign as any,
                            color: containerStyleObj.color, lineHeight: containerStyleObj.lineHeight,
                            whiteSpace: 'pre-wrap', width: '100%', height: '100%',
                        };
                        delete containerStyleObj.fontFamily; delete containerStyleObj.fontSize;
                        delete containerStyleObj.fontWeight; delete containerStyleObj.fontStyle;
                        delete containerStyleObj.textDecoration; delete containerStyleObj.textAlign;
                        delete containerStyleObj.color; delete containerStyleObj.lineHeight;

                        slideContentHtml += `<div style="${cssPropertiesToString(containerStyleObj)}"><div style="${cssPropertiesToString(textStyleObj)}">${element.content}</div></div>`;
                    } else if (element.type === 'IMAGE') {
                        const style = cssPropertiesToString(element.style);
                        slideContentHtml += `<div style="${style}"><img src="${element.src}" style="width:100%; height:100%; object-fit: ${element.style.objectFit || 'cover'};" crossOrigin="anonymous" /></div>`;
                    }
                }

                renderContainer.innerHTML = slideContentHtml;
                renderContainer.style.backgroundColor = slide.backgroundColor;

                const canvas = await html2canvas(renderContainer, { useCORS: true, scale: 1 });
                const imgData = canvas.toDataURL('image/png');

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
            }

            document.body.removeChild(renderContainer);
            pdf.save('presentation.pdf');

        } catch (error: any) {
            console.error("Failed to generate PDF:", error);
            setAiLoadingState({ status: 'error', message: `Failed to generate PDF. ${error.message}` });
        } finally {
            setIsDownloading(false);
            if (aiLoadingState.status !== 'error') {
               setAiLoadingState({ status: 'idle', message: '' });
            }
        }
    };

  // --- AI Generation ---
    const handleAIGeneration = async (topic: string, file: File | null, detailLevel: DetailLevel, isStudyDeck: boolean) => {
        setShowAIGenerationModal(false);
        setAiLoadingState({ status: 'loading', message: 'Starting generation...' });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            let documentContent = '';
            if (file) {
                if (file.type.startsWith('image/')) {
                    setAiLoadingState({ status: 'loading', message: 'Processing image with OCR...' });
                    const processedCanvas = await preprocessImageForOCR(file);
                    const worker = await Tesseract.createWorker();
                    await worker.loadLanguage('eng');
                    await worker.initialize('eng');
                    const { data: { text } } = await worker.recognize(processedCanvas);
                    await worker.terminate();
                    documentContent = text;
                } else if (file.type === 'application/pdf') {
                    setAiLoadingState({ status: 'loading', message: 'Extracting content from PDF...' });
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

                    const typedarray = new Uint8Array(await file.arrayBuffer());
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        setAiLoadingState({ status: 'loading', message: `Processing PDF page ${i} of ${pdf.numPages}...` });
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n\n';
                    }
                    documentContent = fullText;
                } else {
                    setAiLoadingState({ status: 'loading', message: 'Reading document...' });
                    documentContent = await file.text();
                }
            }
            
            // Dynamically determine the number of slides based on content length and user preference
            const detailLevelMap = {
                concise: { wordsPerSlide: 275, range: 5 },
                balanced: { wordsPerSlide: 200, range: 8 },
                detailed: { wordsPerSlide: 125, range: 10 },
            };

            const { wordsPerSlide, range } = detailLevelMap[detailLevel];
            const MIN_SLIDES = 8;
            const MAX_SLIDES = 75; // Increased cap for long documents

            let minSlides = 12; // Default for topic-only presentations
            let maxSlides = 18;

            if (documentContent) {
                const wordCount = documentContent.split(/\s+/).filter(Boolean).length;
                if (wordCount > 50) {
                    const calculatedSlides = Math.round(wordCount / wordsPerSlide);
                    const baseSlideCount = Math.max(MIN_SLIDES, Math.min(calculatedSlides, MAX_SLIDES - range));
                    minSlides = baseSlideCount;
                    maxSlides = Math.min(baseSlideCount + range, MAX_SLIDES);
                }
            }

            setAiLoadingState({ status: 'loading', message: `Generating a ${isStudyDeck ? 'study deck' : 'presentation'} with approx. ${minSlides}-${maxSlides} slides...` });
            
            const presentationContentSchema = {
                type: Type.OBJECT,
                properties: {
                    slides: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                subtitle: { type: Type.STRING },
                                text: { type: Type.STRING },
                                points: { type: Type.ARRAY, items: { type: Type.STRING } },
                                image_keyword: { type: Type.STRING },
                                image_keyword_2: { type: Type.STRING },
                                left_text: { type: Type.STRING },
                                right_text: { type: Type.STRING },
                                points_left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                points_right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                quote: { type: Type.STRING },
                                author: { type: Type.STRING },
                                statistic: { type: Type.STRING },
                                description: { type: Type.STRING },
                                column_1_title: { type: Type.STRING },
                                column_1_text: { type: Type.STRING },
                                column_2_title: { type: Type.STRING },
                                column_2_text: { type: Type.STRING },
                                column_3_title: { type: Type.STRING },
                                column_3_text: { type: Type.STRING },
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                                sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ['title'],
                        },
                    },
                },
                required: ['slides'],
            };

            const availableImageKeywords = Object.keys(IMAGE_KEYWORD_MAP).join(', ');

            const presentationSystemInstruction = `
                You are an expert presentation content creator... [Your existing detailed prompt]
            `;
            
            const studyDeckSystemInstruction = `
                You are an expert academic assistant. Your task is to synthesize a topic or a long document into a high-quality, information-dense "Study Deck". This is for learning and revision, not for a visual presentation.

                **CRITICAL REQUIREMENT #1: VALID JSON and LaTeX SYNTAX**
                (Same as presentation mode...)
                1.  **DOUBLE ESCAPE ALL BACKSLASHES:** Inside a JSON string, every single backslash \`\\\` character from your LaTeX code MUST be escaped with another backslash.
                2.  **Examples:** \`\\sum\` -> \`"\\\\sum"\`, \`\\frac{a}{b}\` -> \`"\\\\frac{a}{b}"\`.
                3.  **Full Equation Example:** The LaTeX equation \`$$d_x(y) = \\min_v \\{c(x,v) + d_v(y)\\}\$\$\` MUST be written in the JSON as: \`"$$d_x(y) = \\\\min_v \\\\{c(x,v) + d_v(y)\\\\}\$\$\`

                **CRITICAL REQUIREMENT #2: STUDY DECK CONTENT RULES**
                1.  **Slide Count:** Generate a detailed deck with ${minSlides} to ${maxSlides} slides.
                2.  **Information Density:** PRIORITIZE this. Slides should be content-rich. Use detailed text and multi-level bullet points. Do not leave slides sparse.
                3.  **Logical Structure for Learning:**
                    - Start with a title slide covering the core topic.
                    - Follow with slides defining key concepts ('Key Concept & Definition').
                    - Use 'Detailed Breakdown' slides for in-depth explanation of topics.
                    - Use 'Q&A / Flashcard' slides for important questions and answers.
                    - Conclude with a 'Summary' slide.
                    - **Crucially, if the source document contains references, create ONE final slide with the title "Sources & Further Reading" and list them in the 'sources' array.**
                4.  **Content Fields:**
                    - **title:** Every slide MUST have a title.
                    - **text:** For detailed explanations.
                    - **points:** For structured lists. Use nested points where appropriate (e.g., " - Main Point\n  - Sub-point").
                    - **question / answer:** For flashcard-style slides.
                    - **sources:** An array of strings for the final citation slide.
                5.  **NO VISUAL FLUFF:** Do not use 'image_keyword' or 'emoji' placeholders. This is for study, not presentation. Focus entirely on the textual content.
            `;

            const systemInstruction = isStudyDeck ? studyDeckSystemInstruction : presentationSystemInstruction;
            
            // --- Retry Logic Implementation ---
            const MAX_RETRIES = 3;
            const INITIAL_BACKOFF_MS = 2000;
            let generationResponse: GenerateContentResponse | null = null;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    generationResponse = await ai.models.generateContent({
                        model: "gemini-2.5-pro",
                        contents: `
                            The topic is: "${topic}".
                            Synthesize this topic into a ${isStudyDeck ? 'Study Deck' : 'Presentation'} based on the following document content (if provided).
                            Document Content:
                            ---
                            ${documentContent || 'No document provided. Base your analysis on the topic alone.'}
                            ---
                        `,
                        config: {
                            systemInstruction: systemInstruction,
                            responseMimeType: 'application/json',
                            responseSchema: presentationContentSchema,
                        },
                    });
                    break; // Success, exit loop
                } catch (error: any) {
                    console.warn(`AI generation attempt ${attempt + 1} failed.`, error);
                    if (attempt === MAX_RETRIES - 1) {
                        throw error; // Last attempt failed, re-throw the error
                    }
                    const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                    const jitter = delay * (0.5 + Math.random() * 0.5); // Add jitter
                    setAiLoadingState({ status: 'loading', message: `AI generation failed. Retrying in ${Math.round(jitter / 1000)}s... (Attempt ${attempt + 2}/${MAX_RETRIES})` });
                    await new Promise(resolve => setTimeout(resolve, jitter));
                }
            }

            if (!generationResponse) {
                throw new Error("AI generation failed after multiple retries.");
            }

            setAiLoadingState({ status: 'loading', message: 'Parsing and validating AI response...' });
            const jsonText = generationResponse.text.trim();
            
            // Apply the parsing algorithm to fix potential LaTeX backslash errors before parsing.
            const repairedJsonText = repairJsonWithLatex(jsonText);
            const generated = JSON.parse(repairedJsonText);

            if (!generated.slides || !Array.isArray(generated.slides)) {
                throw new Error("AI response did not contain a valid 'slides' array.");
            }

            const templatesToUse = isStudyDeck ? STUDY_DECK_TEMPLATES : SLIDE_TEMPLATES;
            const newSlides = generateSlidesFromAIResponse(generated.slides, templatesToUse, isStudyDeck);

            setSlides(prev => [...prev, ...newSlides]);
            setCurrentSlideId(newSlides[0]?.id || null);
            setAiLoadingState({ status: 'idle', message: '' });

        } catch (error: any) {
            console.error("AI generation failed:", error);
            const errorMessage = error.message || 'An unknown error occurred. The AI may have returned an invalid structure.';
            setAiLoadingState({ status: 'error', message: errorMessage });
        }
    };


  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100">
      <Toolbar
        onAddSlide={handleAddSlide}
        onAddElement={handleAddElement}
        onPresent={handlePresent}
        onShowTemplates={() => setShowTemplates(true)}
        onShowLatexGuide={() => setShowLatexGuide(true)}
        onSave={handleSave}
        onLoad={handleLoad}
        onGenerate={() => setShowAIGenerationModal(true)}
        isGenerating={aiLoadingState.status === 'loading'}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      <main className="flex flex-grow overflow-hidden">
        <SlidePreviewPanel
          slides={slides}
          currentSlideId={currentSlideId}
          onSelectSlide={handleSelectSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
        />
        <EditorPanel
          slide={currentSlide}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onUpdateElementStyle={handleUpdateElementStyle}
          onDeleteElement={handleDeleteElement}
          onMoveElementLayer={handleMoveElementLayer}
          onUpdateSlideBackground={handleUpdateSlideBackground}
          showImageGallery={showImageGallery}
          onImageSelect={handleImageSelectedFromGallery}
          onCloseImageGallery={() => setShowImageGallery(false)}
        />
      </main>
      
      {isViewingPresentation && <PresentationView slides={slides} onExit={() => setIsViewingPresentation(false)} />}
      {showTemplates && <TemplateGallery onSelectTemplate={handleAddSlideFromTemplate} onClose={() => setShowTemplates(false)} />}
      {showLatexGuide && <LatexGuide onClose={() => setShowLatexGuide(false)} />}
      {showAIGenerationModal && <AIGenerationModal onGenerate={handleAIGeneration} onClose={() => setShowAIGenerationModal(false)} isGenerating={aiLoadingState.status === 'loading'} />}
      <AILoadingModal status={aiLoadingState.status} message={aiLoadingState.message} onClose={() => setAiLoadingState({ status: 'idle', message: '' })} />
    </div>
  );
};

export default App;
