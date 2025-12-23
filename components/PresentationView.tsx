

import React, { useState, useEffect } from 'react';
import { Slide, IconElement, ShapeElement, TableElement, ChartElement } from '../types';
import { XIcon } from './icons/XIcon';
import RenderedText from './RenderedText';
import { IconComponent } from './icons/library';
import SlideBackground from './SlideBackground';
import ChartRenderer from './ChartRenderer';

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

      <div className="w-full h-full relative" style={{ aspectRatio: '16/9', maxWidth: '100vw', maxHeight: '100vh' }}>
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
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    fontFamily: (element.style as any).fontFamily,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    fontSize: (element.style as any).fontSize,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    fontWeight: (element.style as any).fontWeight,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    fontStyle: (element.style as any).fontStyle,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    textDecoration: (element.style as any).textDecoration,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    textAlign: (element.style as any).textAlign as any,
                                    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                    color: (element.style as any).color,
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'break-word',
                                  }}
                                />;
                    case 'IMAGE':
                        // Fix: Cast element.style to any to access objectFit property.
                        return <img src={element.src} alt="" className="w-full h-full" style={{ objectFit: (element.style as any).objectFit || 'cover' }} />;
                    case 'SHAPE':
                        // Fix: Cast element.style to any to access borderRadius property.
                        return <div className="w-full h-full" style={{ borderRadius: (element as ShapeElement).shape === 'ELLIPSE' ? '50%' : (element.style as any).borderRadius }} />;
                    case 'ICON':
                        return <IconComponent iconName={(element as IconElement).iconName} className="w-full h-full" />;
                    case 'TABLE':
                        const tableEl = element as TableElement;
                        return (
                            <table className="w-full h-full border-collapse table-fixed" style={{fontSize: '16px'}}>
                                <tbody>
                                    {tableEl.cellData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell) => (
                                                <td key={cell.id} className="border border-gray-500 p-2" style={cell.style} dangerouslySetInnerHTML={{ __html: cell.content }}>
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
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
        {currentSlideIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PresentationView;