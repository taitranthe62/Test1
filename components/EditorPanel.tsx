import React, { useState, useRef, useEffect } from 'react';
import { Slide, SlideElement } from '../types';
import FormatPanel from './FormatPanel';
import ImageGallery from './ImageGallery';
import EmojiPicker from './EmojiPicker';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import RenderedText from './RenderedText';

interface EditorPanelProps {
  slide: Slide | undefined;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id:string, newElement: Partial<SlideElement>) => void;
  onUpdateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
  onDeleteElement: (id: string) => void;
  onMoveElementLayer: (id: string, direction: 'forward' | 'backward') => void;
  onUpdateSlideBackground: (color: string) => void;
  showImageGallery: boolean;
  onImageSelect: (src: string) => void;
  onCloseImageGallery: () => void;
}

type ResizeDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ElementWrapperProps {
    children: React.ReactNode;
    element: SlideElement;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
    onUpdateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
}

const ElementWrapper: React.FC<ElementWrapperProps> = ({ children, element, isSelected, onSelect, onUpdateElementStyle }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleResize = (e: MouseEvent, direction: ResizeDirection) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        const parentRect = ref.current.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const startLeft = rect.left - parentRect.left;
        const startTop = rect.top - parentRect.top;

        const doDrag = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            if (direction.includes('right')) newWidth = startWidth + dx;
            if (direction.includes('left')) {
                newWidth = startWidth - dx;
                newLeft = startLeft + dx;
            }
            if (direction.includes('bottom')) newHeight = startHeight + dy;
            if (direction.includes('top')) {
                newHeight = startHeight - dy;
                newTop = startTop + dy;
            }
            
            // Convert to percentage for responsive scaling
            const parentWidth = parentRect.width;
            const parentHeight = parentRect.height;

            onUpdateElementStyle(element.id, {
                left: `${(newLeft / parentWidth) * 100}%`,
                top: `${(newTop / parentHeight) * 100}%`,
                width: `${(newWidth / parentWidth) * 100}%`,
                height: `${(newHeight / parentHeight) * 100}%`,
            });
        };

        const stopDrag = () => {
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    };

    const handleDragStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.clientX;
        const startY = e.clientY;

        const doDrag = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            onUpdateElementStyle(element.id, {
                transform: `translate(${dx}px, ${dy}px)`
            });
        };

        const stopDrag = (upEvent: MouseEvent) => {
            setIsDragging(false);
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);

            if (!ref.current || !ref.current.parentElement) return;

            const parentRect = ref.current.parentElement.getBoundingClientRect();
            const rect = ref.current.getBoundingClientRect();
            
            const newLeft = rect.left - parentRect.left;
            const newTop = rect.top - parentRect.top;

            onUpdateElementStyle(element.id, {
                left: `${(newLeft / parentRect.width) * 100}%`,
                top: `${(newTop / parentRect.height) * 100}%`,
                transform: 'none',
            });
        };
        
        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    };


    return (
        <div
            ref={ref}
            style={{ ...element.style, transition: isDragging ? 'none' : 'outline 0.1s ease-in-out' }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(element.id);
            }}
            onMouseDown={(e) => {
                 e.stopPropagation();
                 onSelect(element.id);
                 handleDragStart(e);
            }}
            className={`absolute ${isSelected ? 'outline outline-2 outline-blue-500 outline-offset-2' : 'hover:outline hover:outline-1 hover:outline-blue-400'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
            {children}
            {isSelected && (['top-left', 'top-right', 'bottom-left', 'bottom-right'] as ResizeDirection[]).map(dir => (
                <div
                    key={dir}
                    className={`resize-handle ${dir}`}
                    onMouseDown={(e) => { e.stopPropagation(); handleResize(e.nativeEvent, dir); }}
                />
            ))}
        </div>
    )
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onUpdateElementStyle,
  onDeleteElement,
  onMoveElementLayer,
  onUpdateSlideBackground,
  showImageGallery,
  onImageSelect,
  onCloseImageGallery
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFormatPanelVisible, setIsFormatPanelVisible] = useState(true);
  const selectedElement = slide?.elements.find(e => e.id === selectedElementId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onSelectElement(null);
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelectElement]);

  const handleSelectEmoji = (emoji: string) => {
    if (selectedElement && selectedElement.type === 'TEXT') {
        // This is a simplified append; a more robust solution would handle cursor position
        onUpdateElement(selectedElement.id, { content: selectedElement.content + emoji });
    }
    setShowEmojiPicker(false);
  };

  if (!slide) {
    return <div className="flex-grow flex items-center justify-center bg-gray-200 text-gray-500">Select a slide to start editing</div>;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-200 relative overflow-hidden">
        <div className="w-full h-full shadow-lg relative" style={{ aspectRatio: '16/9', maxWidth: '1280px', backgroundColor: slide.backgroundColor }}>
            {slide.elements.map(element => (
                <ElementWrapper 
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedElementId}
                    onSelect={onSelectElement}
                    onUpdateElementStyle={onUpdateElementStyle}
                >
                    {element.type === 'TEXT' ? (
                        element.id === selectedElementId ? (
                            <div
                                data-content-editable="true"
                                contentEditable
                                suppressContentEditableWarning
                                onMouseDown={(e) => e.stopPropagation()}
                                onBlur={(e) => onUpdateElement(element.id, { content: e.currentTarget.innerHTML })}
                                className="w-full h-full bg-transparent resize-none border-none outline-none p-2 cursor-text"
                                style={{
                                    fontFamily: element.style.fontFamily,
                                    fontSize: element.style.fontSize,
                                    fontWeight: element.style.fontWeight,
                                    fontStyle: element.style.fontStyle,
                                    textDecoration: element.style.textDecoration,
                                    textAlign: element.style.textAlign as any,
                                    color: element.style.color,
                                    lineHeight: element.style.lineHeight,
                                }}
                                dangerouslySetInnerHTML={{ __html: element.content }}
                            />
                        ) : (
                             <RenderedText
                                content={element.content}
                                style={{
                                    width: '100%', height: '100%',
                                    fontFamily: element.style.fontFamily,
                                    fontSize: element.style.fontSize,
                                    fontWeight: element.style.fontWeight,
                                    fontStyle: element.style.fontStyle,
                                    textDecoration: element.style.textDecoration,
                                    textAlign: element.style.textAlign as any,
                                    color: element.style.color,
                                    lineHeight: element.style.lineHeight,
                                    padding: '8px', // Corresponds to p-2
                                    whiteSpace: 'pre-wrap'
                                }}
                            />
                        )
                    ) : (
                        <img src={element.src} alt="" className="w-full h-full object-cover pointer-events-none" />
                    )}
                </ElementWrapper>
            ))}
        </div>
        
        {showImageGallery && <ImageGallery onSelectImage={onImageSelect} onClose={onCloseImageGallery} />}
        {showEmojiPicker && <EmojiPicker onSelectEmoji={handleSelectEmoji} onClose={() => setShowEmojiPicker(false)} />}
        
        {isFormatPanelVisible ? (
            <FormatPanel
                element={selectedElement || null}
                onUpdateElement={onUpdateElement}
                onUpdateStyle={onUpdateElementStyle}
                onDelete={onDeleteElement}
                onMoveLayer={onMoveElementLayer}
                slideBackgroundColor={slide.backgroundColor}
                onUpdateSlideBackground={onUpdateSlideBackground}
                onShowEmojiPicker={() => setShowEmojiPicker(true)}
                onClose={() => setIsFormatPanelVisible(false)}
            />
        ) : (
            <button
                onClick={() => setIsFormatPanelVisible(true)}
                className="absolute top-4 right-4 bg-white shadow-lg z-20 p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-blue-500 transition-colors"
                title="Show Formatting Panel"
            >
                <PaintBrushIcon />
            </button>
        )}
    </div>
  );
};

export default EditorPanel;