import React, { useState, useRef } from 'react';
import { Slide } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface SlidePreviewPanelProps {
  slides: Slide[];
  currentSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (dragIndex: number, hoverIndex: number) => void;
}

const SlidePreview: React.FC<{ 
    slide: Slide; 
    index: number;
    isSelected: boolean; 
    onSelect: () => void;
    onMoveSlide: (dragIndex: number, hoverIndex: number) => void;
    setDragOverIndex: (index: number | null) => void;
    isDragOver: boolean;
}> = ({ slide, index, isSelected, onSelect, onMoveSlide, setDragOverIndex, isDragOver }) => {
    const scale = 0.15;
    const previewHeight = 720 * scale;

    const ref = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
        ref.current?.classList.add('dragging-preview');
    };

    const handleDragEnd = () => {
        ref.current?.classList.remove('dragging-preview');
        setDragOverIndex(null);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        onMoveSlide(dragIndex, index);
        setDragOverIndex(null);
    };

    return (
        <div
            ref={ref}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={onSelect}
            className={`w-full aspect-[16/9] border-2 rounded-lg cursor-pointer relative overflow-hidden transition-all duration-150 bg-white group
                ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-blue-400'}
                ${isDragOver ? 'drop-indicator' : ''}
            `}
            style={{ height: previewHeight }}
        >
            <div 
                className="absolute top-0 left-0"
                style={{ 
                    width: `calc(100% / ${scale})`,
                    height: `calc(100% / ${scale})`,
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top left', 
                    backgroundColor: slide.backgroundColor,
                    pointerEvents: 'none'
                }}
            >
                {slide.elements.map(element => {
                    const elementStyle: React.CSSProperties = {
                        ...element.style, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    };
                    return (
                        <div key={element.id} style={elementStyle}>
                            {element.type === 'TEXT' ? <p>{element.content}</p> : <img src={element.src} alt="" className="w-full h-full object-cover" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SlidePreviewPanel: React.FC<SlidePreviewPanelProps> = ({ slides, currentSlideId, onSelectSlide, onDeleteSlide, onMoveSlide }) => {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    
    return (
        <div className="w-64 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="relative group/slide-item">
                        <div className="flex items-center text-sm font-medium text-gray-600 mb-1 ml-1">Slide {index + 1}</div>
                        <SlidePreview
                            slide={slide}
                            index={index}
                            isSelected={slide.id === currentSlideId}
                            onSelect={() => onSelectSlide(slide.id)}
                            onMoveSlide={onMoveSlide}
                            setDragOverIndex={setDragOverIndex}
                            isDragOver={dragOverIndex === index}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
                            className="absolute top-0 right-0 mt-8 mr-2 p-1.5 bg-white rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/slide-item:opacity-100 transition-opacity z-10 shadow"
                            title="Delete Slide"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SlidePreviewPanel;