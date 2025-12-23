
import React, { useState, useEffect } from 'react';
import { Slide, IconElement, ShapeElement, TableElement, ChartElement } from '../types';
import { XIcon } from './icons/XIcon';
import RenderedText from './RenderedText';
import { IconComponent } from './icons/library';
import SlideBackground from './SlideBackground';
import ChartRenderer from './ChartRenderer';
import { sanitizeHtml } from '../utils';

interface PresentationViewProps {
  slides: Slide[];
  onExit: () => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ slides, onExit }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onExit]);

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
      return (
        <div className="fixed inset-0 bg-black flex items-center justify-center text-white z-50">
            No slides to present.
            <button onClick={onExit} className="absolute top-4 right-4 text-white hover:text-gray-300">
                <XIcon size={32} />
            </button>
        </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8 z-50">
      <button onClick={onExit} className="absolute top-4 right-4 text-white hover:text-gray-300 z-20">
        <XIcon size={32} />
      </button>

      <div className="w-full h-full relative shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9', maxWidth: '100vw', maxHeight: '100vh' }}>
        <SlideBackground background={currentSlide.background} />
        {currentSlide.elements.map(element => (
          <div key={element.id} style={element.style}>
            {(() => {
                switch (element.type) {
                    case 'TEXT':
                        return <RenderedText
                                  content={element.content}
                                  style={{
                                    width: '100%', height: '100%',
                                    fontFamily: (element.style as any).fontFamily,
                                    fontSize: (element.style as any).fontSize,
                                    fontWeight: (element.style as any).fontWeight,
                                    fontStyle: (element.style as any).fontStyle,
                                    textDecoration: (element.style as any).textDecoration,
                                    textAlign: (element.style as any).textAlign as any,
                                    color: (element.style as any).color,
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'break-word',
                                  }}
                                />;
                    case 'IMAGE':
                        return <img src={element.src} alt="" className="w-full h-full" style={{ objectFit: (element.style as any).objectFit || 'cover' }} />;
                    case 'SHAPE':
                        return <div className="w-full h-full" style={{ borderRadius: (element as ShapeElement).shape === 'ELLIPSE' ? '50%' : (element.style as any).borderRadius }} />;
                    case 'ICON':
                        return <IconComponent iconName={(element as IconElement).iconName} className="w-full h-full" />;
                    case 'TABLE':
                        const tableEl = element as TableElement;
                        // Use accent color for header if available, else standard gray
                        const headerBg = currentSlide.background.accentColor || '#3b82f6';
                        return (
                            <table className="w-full h-full border-collapse table-fixed shadow-md bg-white/50 backdrop-blur-sm" style={{fontSize: '18px'}}>
                                <tbody>
                                    {tableEl.cellData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex === 0 ? "" : "even:bg-black/5"}>
                                            {row.map((cell) => (
                                                <td 
                                                    key={cell.id} 
                                                    className="border border-gray-300 p-3 align-middle" 
                                                    style={{
                                                        ...cell.style,
                                                        backgroundColor: rowIndex === 0 ? headerBg : undefined,
                                                        color: rowIndex === 0 ? '#fff' : 'inherit',
                                                        fontWeight: rowIndex === 0 ? 'bold' : 'normal',
                                                        borderColor: rowIndex === 0 ? headerBg : '#e2e8f0'
                                                    }} 
                                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell.content) }}
                                                >
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        );
                    case 'CHART':
                        return <ChartRenderer element={element as ChartElement} />;
                    default:
                        return null;
                }
            })()}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium">
        {currentSlideIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PresentationView;
