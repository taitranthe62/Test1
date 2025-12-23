
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Slide, SlideElement, ImageElement, IconElement, ShapeElement, TableElement, ChartElement } from '../types';
import FormatPanel from './FormatPanel';
import EmojiPicker from './EmojiPicker';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import RenderedText from './RenderedText';
import { IconComponent } from './icons/library';
import SlideBackground from './SlideBackground';
import ChartRenderer from './ChartRenderer';
import { PresentationContext } from '../presentationContext';
import { ActionTypes } from '../actions';

interface EditorPanelProps {
  showImageGallery: boolean;
  onCloseImageGallery: () => void;
  showIconPicker: boolean;
  onCloseIconPicker: () => void;
}

type ResizeDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ElementWrapperProps {
    children: React.ReactNode;
    element: SlideElement;
    isSelected: boolean;
}

const ElementWrapper: React.FC<ElementWrapperProps> = ({ children, element, isSelected }) => {
    const { dispatch } = useContext(PresentationContext);
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const onSelect = (id: string | null) => dispatch({ type: ActionTypes.SELECT_ELEMENT, payload: { elementId: id } });
    const onUpdateElementStyle = (id: string, newStyle: React.CSSProperties) => dispatch({ type: ActionTypes.UPDATE_ELEMENT_STYLE, payload: { elementId: id, newStyle } });

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

const RenderElement = React.memo(({ element, isSelected }: { element: SlideElement, isSelected: boolean }) => {
    const { dispatch } = useContext(PresentationContext);

    switch (element.type) {
        case 'TEXT':
            return isSelected ? (
                <div
                    data-content-editable="true"
                    contentEditable
                    suppressContentEditableWarning
                    onMouseDown={(e) => e.stopPropagation()}
                    onBlur={(e) => dispatch({
                        type: ActionTypes.UPDATE_ELEMENT,
                        payload: { elementId: element.id, newContent: e.currentTarget.innerHTML }
                    })}
                    className="w-full h-full bg-transparent resize-none border-none outline-none p-2 cursor-text"
                    style={{ ...element.style, overflowY: 'auto', position: undefined, left: undefined, top: undefined, width: undefined, height: undefined, overflowWrap: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                />
            ) : (
                <RenderedText
                    content={element.content}
                    style={{ ...element.style, width: '100%', height: '100%', position: undefined, left: undefined, top: undefined, padding: '8px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                />
            );
        case 'IMAGE':
            return <img src={element.src} alt="" className="w-full h-full object-cover pointer-events-none" style={{ objectFit: (element.style as any).objectFit || 'cover' }} />;
        case 'SHAPE':
            return <div className="w-full h-full pointer-events-none" style={{ borderRadius: (element as ShapeElement).shape === 'ELLIPSE' ? '50%' : (element.style as any).borderRadius }}></div>;
        case 'ICON':
            return <IconComponent iconName={(element as IconElement).iconName} className="w-full h-full pointer-events-none" />;
        case 'TABLE':
            const tableEl = element as TableElement;
            return (
                <table className="w-full h-full border-collapse table-fixed">
                    <tbody>
                        {tableEl.cellData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={cell.id} className="border border-gray-300 p-1" style={cell.style}>
                                        {isSelected ? (
                                            <div
                                                contentEditable
                                                suppressContentEditableWarning
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onBlur={(e) => dispatch({
                                                    type: ActionTypes.UPDATE_TABLE_CELL,
                                                    payload: { elementId: tableEl.id, rowIndex, colIndex, newContent: e.currentTarget.innerHTML }
                                                })}
                                                className="w-full h-full bg-transparent outline-none cursor-text p-1"
                                                dangerouslySetInnerHTML={{ __html: cell.content }}
                                            />
                                        ) : (
                                            <RenderedText 
                                                content={cell.content}
                                                style={{ width: '100%', height: '100%', fontSize: 'inherit' }}
                                            />
                                        )}
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
});


const EditorPanel: React.FC<EditorPanelProps> = ({}) => {
  const { state, dispatch } = useContext(PresentationContext);
  const { currentSlide: slide, selectedElementId, selectedElement } = state;
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFormatPanelVisible, setIsFormatPanelVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            dispatch({ type: ActionTypes.SELECT_ELEMENT, payload: { elementId: null } });
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleSelectEmoji = (emoji: string) => {
    if (selectedElement && selectedElement.type === 'TEXT') {
        const payload = { elementId: selectedElement.id, newContent: selectedElement.content + emoji };
        dispatch({ type: ActionTypes.UPDATE_ELEMENT, payload });
    }
    setShowEmojiPicker(false);
  };
  
  if (!slide) {
    return <div className="flex-grow flex items-center justify-center bg-gray-200 text-gray-500">Select or create a slide to start editing</div>;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-200 relative overflow-hidden">
        <div className="w-full h-full shadow-2xl relative bg-white border border-gray-300" style={{ aspectRatio: '16/9', maxWidth: '1280px' }}>
            <SlideBackground background={slide.background} />
            {slide.elements.map(element => (
                <ElementWrapper 
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedElementId}
                >
                    <RenderElement element={element} isSelected={element.id === selectedElementId} />
                </ElementWrapper>
            ))}
        </div>
        
        {showEmojiPicker && <EmojiPicker onSelectEmoji={handleSelectEmoji} onClose={() => setShowEmojiPicker(false)} />}
        
        {isFormatPanelVisible ? (
            <FormatPanel
                slideBackground={slide.background}
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
