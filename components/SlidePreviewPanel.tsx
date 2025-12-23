

import React, { useState, useRef, useContext } from 'react';
import { Slide, ImageElement, ShapeElement } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import SlideBackground from './SlideBackground';
import { PresentationContext } from '../presentationContext';
import { ActionTypes } from '../actions';

interface SlidePreviewProps { 
    slide: Slide; 
    index: number;
    isSelected: boolean; 
    setDragOverIndex: (index: number | null) => void;
    isDragOver: boolean;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, index, isSelected, setDragOverIndex, isDragOver }) => {
    const scale = 0.15;
    const previewHeight = 720 * scale;
    const { dispatch } = useContext(PresentationContext);

    const ref = useRef<HTMLDivElement>(null);

    const handleSelect = () => dispatch({ type: ActionTypes.SELECT_SLIDE, payload: { slideId: slide.id } });
    
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
        dispatch({ type: ActionTypes.MOVE_SLIDE, payload: { dragIndex, hoverIndex: index } });
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
            onClick={handleSelect}
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
                    pointerEvents: 'none'
                }}
            >
                <SlideBackground background={slide.background} />
                {slide.elements.map(element => {
                    const elementStyle: React.CSSProperties = {
                        ...element.style,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'break-word',
                    };

                    if (element.type === 'SHAPE') {
                        if ((element as ShapeElement).shape === 'ELLIPSE') {
                            // Fix: Cast elementStyle to any to set borderRadius property.
                            (elementStyle as any).borderRadius = '50%';
                        }
                    }
                    
                    return (
                        <div key={element.id} style={elementStyle}>
                            {element.type === 'TEXT' && <div dangerouslySetInnerHTML={{ __html: element.content }}></div>}
                            {element.type === 'IMAGE' && <img src={(element as ImageElement).src} alt="" className="w-full h-full object-cover" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SlidePreviewPanel: React.FC = () => {
    const { state, dispatch } = useContext(PresentationContext);
    const { slides, currentSlideId } = state;
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
                            setDragOverIndex={setDragOverIndex}
                            isDragOver={dragOverIndex === index}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); dispatch({ type: ActionTypes.DELETE_SLIDE, payload: { slideId: slide.id } }); }}
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