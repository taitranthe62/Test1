
import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import PresentationView from './components/PresentationView';
import AIGenerationModal, { DetailLevel } from './components/AIGenerationModal';
import AILoadingModal from './components/AILoadingModal';
import { Slide, SlideTemplate, TableElement, ChartElement, ChartData, ShapeElement } from './types';
import { STUDY_DECK_THEMES, THEME_PACKS, SLIDE_LAYOUTS } from './templates';
import { backgroundDefToCss } from './utils';
import { preprocessImageForOCR } from './ocr.utils';
import { generateSlidesFromSpecification } from './slideGenerator';
import TableCreatorModal from './components/TableCreatorModal';
import { usePresentationState } from './usePresentationState';
import { PresentationContext } from './presentationContext';
import { ActionTypes } from './actions';
import { saveSlides, loadSlides } from './db';
import { generatePresentationFromTopic } from './ai.generator';

const App: React.FC = () => {
  const { state, dispatch } = usePresentationState();
  const { slides, currentSlideId, currentSlide } = state;

  // UI State
  const [isViewingPresentation, setIsViewingPresentation] = useState(false);
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);
  const [aiLoadingState, setAiLoadingState] = useState<{ status: 'idle' | 'loading' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTableCreator, setShowTableCreator] = useState(false);
  
  // Sidebar states
  const [activeSidebarTab, setActiveSidebarTab] = useState<'outline' | 'layouts' | 'images' | 'graphics'>('outline');

  const handlePresent = () => setIsViewingPresentation(true);
  
  const handleSave = async () => {
      try {
          await saveSlides(slides);
          alert('Đã lưu bài thuyết trình!');
      } catch (error: any) {
          console.error("Manual save failed:", error);
          alert(`Không thể lưu bài thuyết trình: ${error.message}`);
      }
  };

  const handleLoad = async () => {
    try {
      const savedSlides = await loadSlides();
      if (savedSlides && savedSlides.length > 0) {
        dispatch({ type: ActionTypes.LOAD_SLIDES, payload: { slides: savedSlides } });
        alert('Đã tải bài thuyết trình!');
      } else {
        alert('Không tìm thấy bản lưu nào.');
      }
    } catch (error: any) {
      console.error("Failed to load presentation:", error);
      alert(`Không thể tải bài thuyết trình: ${error.message}`);
    }
  };

  const handleApplyLayout = (template: SlideTemplate) => {
    dispatch({ type: ActionTypes.ADD_SLIDE_FROM_TEMPLATE, payload: { template } });
  };
  
  const handleCreateTable = (rows: number, columns: number) => {
    dispatch({ type: ActionTypes.ADD_ELEMENT, payload: { type: 'TABLE', options: { rows, columns } } });
    setShowTableCreator(false);
  };
    
  const handleDownload = async () => {
      if (isDownloading) return;
      setIsDownloading(true);
      setAiLoadingState({ status: 'loading', message: 'Đang chuẩn bị bản PDF chất lượng cao...' });

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
          renderContainer.style.overflow = 'hidden';
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
              setAiLoadingState({ status: 'loading', message: `Đang kết xuất trang ${i + 1}/${slides.length}...` });

              let slideContentHtml = '';
              for (const element of slide.elements) {
                  if (element.type === 'TEXT') {
                      const containerStyleObj = { ...element.style };
                      const textStyleObj: React.CSSProperties = {
                          fontFamily: (containerStyleObj as any).fontFamily, fontSize: (containerStyleObj as any).fontSize,
                          fontWeight: (containerStyleObj as any).fontWeight, fontStyle: (containerStyleObj as any).fontStyle,
                          textDecoration: (containerStyleObj as any).textDecoration, textAlign: (containerStyleObj as any).textAlign as any,
                          color: (containerStyleObj as any).color, lineHeight: (containerStyleObj as any).lineHeight,
                          whiteSpace: 'pre-wrap', width: '100%', height: '100%',
                      };
                      delete (containerStyleObj as any).fontFamily; delete (containerStyleObj as any).fontSize;
                      delete (containerStyleObj as any).fontWeight; delete (containerStyleObj as any).fontStyle;
                      delete (containerStyleObj as any).textDecoration; delete (containerStyleObj as any).textAlign;
                      delete (containerStyleObj as any).color; delete (containerStyleObj as any).lineHeight;

                      slideContentHtml += `<div style="${cssPropertiesToString(containerStyleObj)}"><div style="${cssPropertiesToString(textStyleObj)}">${element.content}</div></div>`;
                  } else if (element.type === 'IMAGE') {
                      const style = cssPropertiesToString(element.style);
                      slideContentHtml += `<div style="${style}"><img src="${element.src}" style="width:100%; height:100%; object-fit: ${(element.style as any).objectFit || 'cover'};" crossOrigin="anonymous" /></div>`;
                  } else if (element.type === 'TABLE') {
                      let tableHTML = `<table style="width:100%; height:100%; border-collapse: collapse; table-layout: fixed;"><tbody>`;
                      for (let r = 0; r < element.rows; r++) {
                          tableHTML += `<tr>`;
                          for (let c = 0; c < element.columns; c++) {
                              const cell = element.cellData[r][c];
                              const cellStyle = `border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; ${cssPropertiesToString(cell.style)}`;
                              tableHTML += `<td style="${cellStyle}">${cell.content}</td>`;
                          }
                          tableHTML += `</tr>`;
                      }
                      tableHTML += `</tbody></table>`;
                      slideContentHtml += `<div style="${cssPropertiesToString(element.style)}">${tableHTML}</div>`;
                  } else if (element.type === 'SHAPE') {
                      const shape = element as ShapeElement;
                      const style = { ...shape.style };
                      if (shape.shape === 'ELLIPSE') (style as any).borderRadius = '50%';
                      slideContentHtml += `<div style="${cssPropertiesToString(style)}"></div>`;
                  } else if (element.type === 'CHART') {
                      const chart = element as ChartElement;
                      const style = cssPropertiesToString(chart.style);
                      slideContentHtml += `<div style="${style}"><canvas id="pdf-chart-${chart.id}" style="width:100%; height:100%"></canvas></div>`;
                  }
              }

              renderContainer.innerHTML = slideContentHtml;
              const { background, backgroundBlendMode } = backgroundDefToCss(slide.background);
              renderContainer.style.background = background;
              (renderContainer.style as any).backgroundBlendMode = backgroundBlendMode;

              // 1. Kích hoạt KaTeX cho các công thức toán học trong container tạm thời
              if (window.renderMathInElement) {
                window.renderMathInElement(renderContainer, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                    ],
                    throwOnError: false
                });
              }

              // 2. Khởi tạo các biểu đồ trong renderContainer với màu sắc từ background
              for (const element of slide.elements) {
                  if (element.type === 'CHART' && (window as any).Chart) {
                      const canvas = renderContainer.querySelector(`#pdf-chart-${element.id}`) as HTMLCanvasElement;
                      if (canvas) {
                          const chartEl = element as ChartElement;
                          const bg = slide.background;
                          const colors = bg.chartColors || ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#6366f1', '#a855f7'];
                          
                          new (window as any).Chart(canvas, {
                              type: chartEl.chartType.toLowerCase(),
                              data: {
                                  labels: chartEl.data.labels,
                                  datasets: chartEl.data.datasets.map((ds, i) => ({
                                      label: ds.label,
                                      data: ds.data,
                                      backgroundColor: chartEl.chartType === 'PIE' 
                                          ? chartEl.data.labels.map((_, idx) => colors[idx % colors.length])
                                          : colors[i % colors.length],
                                      borderColor: colors[i % colors.length],
                                      borderWidth: 1,
                                      fill: chartEl.chartType !== 'LINE'
                                  }))
                              },
                              options: { 
                                  animation: false, 
                                  responsive: false, 
                                  maintainAspectRatio: false,
                                  plugins: { 
                                    legend: { 
                                      display: true,
                                      labels: { color: bg.secondaryTextColor }
                                    } 
                                  },
                                  scales: chartEl.chartType === 'PIE' ? {} : {
                                    x: { ticks: { color: bg.secondaryTextColor } },
                                    y: { ticks: { color: bg.secondaryTextColor } }
                                  }
                              }
                          });
                      }
                  }
              }

              // Đợi một chút để các canvas và KaTeX kịp render hoàn chỉnh
              await new Promise(resolve => setTimeout(resolve, 150));

              const canvas = await html2canvas(renderContainer, { useCORS: true, scale: 2 });
              const imgData = canvas.toDataURL('image/png');

              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
          }

          document.body.removeChild(renderContainer);
          pdf.save(`${state.slides[0]?.elements.find(e => e.slot === 'title')?.content || 'presentation'}.pdf`);

      } catch (error: any) {
          console.error("Failed to generate PDF:", error);
          setAiLoadingState({ status: 'error', message: `Lỗi xuất PDF: ${error.message}` });
      } finally {
          setIsDownloading(false);
          if (aiLoadingState.status !== 'error') {
             setAiLoadingState({ status: 'idle', message: '' });
          }
      }
  };

  const handleAIGeneration = async (topic: string, file: File | null, detailLevel: DetailLevel, isStudyDeck: boolean) => {
      setShowAIGenerationModal(false);
      
      // Mandatory key check
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
      }

      setAiLoadingState({ status: 'loading', message: 'Đang bắt đầu quá trình tạo...' });

      try {
          let documentContent = '';
          if (file) {
              if (file.type.startsWith('image/')) {
                  setAiLoadingState({ status: 'loading', message: 'Đang trích xuất chữ từ ảnh (OCR)...' });
                  const processedCanvas = await preprocessImageForOCR(file);
                  const worker = await Tesseract.createWorker();
                  await worker.loadLanguage('eng');
                  await worker.initialize('eng');
                  const { data: { text } } = await worker.recognize(processedCanvas);
                  await worker.terminate();
                  documentContent = text;
              } else if (file.type === 'application/pdf') {
                  setAiLoadingState({ status: 'loading', message: 'Đang xử lý tệp PDF...' });
                  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

                  const typedarray = new Uint8Array(await file.arrayBuffer());
                  const pdf = await pdfjsLib.getDocument(typedarray).promise;
                  let fullText = '';
                  for (let i = 1; i <= pdf.numPages; i++) {
                      setAiLoadingState({ status: 'loading', message: `Đang đọc trang ${i}/${pdf.numPages}...` });
                      const page = await pdf.getPage(i);
                      const textContent = await page.getTextContent();
                      fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n\n';
                  }
                  documentContent = fullText;
              } else {
                  setAiLoadingState({ status: 'loading', message: 'Đang đọc nội dung tệp...' });
                  documentContent = await file.text();
              }
          }
          
          const detailLevelMap = {
              concise: { wordsPerSlide: 275, range: 5 },
              balanced: { wordsPerSlide: 200, range: 8 },
              detailed: { wordsPerSlide: 125, range: 10 },
          };

          const { wordsPerSlide, range } = detailLevelMap[detailLevel];
          const MIN_SLIDES = 6;
          const MAX_SLIDES = 25;

          let minSlides = 6;
          let maxSlides = 10;

          if (documentContent) {
              const wordCount = documentContent.split(/\s+/).filter(Boolean).length;
              if (wordCount > 50) {
                  const calculatedSlides = Math.round(wordCount / wordsPerSlide);
                  const baseSlideCount = Math.max(MIN_SLIDES, Math.min(calculatedSlides, MAX_SLIDES - range));
                  minSlides = baseSlideCount;
                  maxSlides = Math.min(baseSlideCount + range, MAX_SLIDES);
              }
          }

          const onProgress = (message: string) => {
              setAiLoadingState({ status: 'loading', message });
          };

          // 1. Tạo DÀN Ý và NỘI DUNG CHỮ TRƯỚC
          const presentationSpec = await generatePresentationFromTopic(
              topic,
              documentContent,
              minSlides,
              maxSlides,
              isStudyDeck,
              onProgress
          );

          const themePacks = isStudyDeck ? STUDY_DECK_THEMES : THEME_PACKS;

          // 2. Lắp ráp Slide với chữ và biểu đồ
          const newSlides = await generateSlidesFromSpecification(
              presentationSpec, 
              themePacks, 
              isStudyDeck,
              onProgress,
              true // skipImages: true để hoàn thành nhanh
          );

          dispatch({ type: ActionTypes.ADD_SLIDES_FROM_AI, payload: { newSlides } });
          
          setAiLoadingState({ status: 'idle', message: '' });

      } catch (error: any) {
          console.error("AI generation failed:", error);
          if (error.message?.includes("Requested entity was not found")) {
            setAiLoadingState({ status: 'error', message: "Vui lòng chọn lại API key của dự án đã bật thanh toán." });
            await window.aistudio.openSelectKey();
          } else {
            setAiLoadingState({ status: 'error', message: error.message || 'Lỗi không xác định.' });
          }
      }
  };

  return (
    <PresentationContext.Provider value={{ state, dispatch }}>
        <div className="flex flex-col h-screen font-sans bg-gray-100">
        <Toolbar
            onAddElement={(type) => {
                if (type === 'TABLE') setShowTableCreator(true);
                else if (type === 'IMAGE') setActiveSidebarTab('images');
                else if (type === 'ICON') setActiveSidebarTab('graphics');
                else dispatch({ type: ActionTypes.ADD_ELEMENT, payload: { type } });
            }}
            onPresent={handlePresent}
            onShowTemplates={() => setActiveSidebarTab('layouts')}
            onSave={handleSave}
            onLoad={handleLoad}
            onGenerate={() => setShowAIGenerationModal(true)}
            isGenerating={aiLoadingState.status === 'loading'}
            onDownload={handleDownload}
            isDownloading={isDownloading}
        />
        <main className="flex flex-grow overflow-hidden">
            <Sidebar 
                activeTab={activeSidebarTab}
                setActiveTab={setActiveSidebarTab}
                onApplyLayout={handleApplyLayout}
            />
            <EditorPanel
                showImageGallery={activeSidebarTab === 'images'}
                onCloseImageGallery={() => setActiveSidebarTab('outline')}
                showIconPicker={activeSidebarTab === 'graphics'}
                onCloseIconPicker={() => setActiveSidebarTab('outline')}
            />
        </main>
        
        {isViewingPresentation && <PresentationView slides={slides} onExit={() => setIsViewingPresentation(false)} />}
        {showAIGenerationModal && <AIGenerationModal onGenerate={handleAIGeneration} onClose={() => setShowAIGenerationModal(false)} isGenerating={aiLoadingState.status === 'loading'} />}
        <AILoadingModal status={aiLoadingState.status} message={aiLoadingState.message} onClose={() => setAiLoadingState({ status: 'idle', message: '' })} />
        {showTableCreator && <TableCreatorModal onCreate={handleCreateTable} onClose={() => setShowTableCreator(false)} />}
        </div>
    </PresentationContext.Provider>
  );
};

export default App;
