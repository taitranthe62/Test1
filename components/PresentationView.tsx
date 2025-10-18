
import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import { XIcon } from './icons/XIcon';
import RenderedText from './RenderedText';

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

      <div className="w-full h-full relative" style={{ backgroundColor: currentSlide.backgroundColor, aspectRatio: '16/9', maxWidth: '100vw', maxHeight: '100vh' }}>
        {currentSlide.elements.map(element => (
          <div key={element.id} style={element.style}>
            {element.type === 'TEXT' ? (
              <RenderedText
                content={element.content}
                style={{
                  fontFamily: element.style.fontFamily,
                  fontSize: element.style.fontSize,
                  fontWeight: element.style.fontWeight,
                  fontStyle: element.style.fontStyle,
                  textDecoration: element.style.textDecoration,
                  textAlign: element.style.textAlign as any,
                  color: element.style.color,
                  whiteSpace: 'pre-wrap'
                }}
              />
            ) : (
              <img src={element.src} alt="" className="w-full h-full object-cover" />
            )}
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