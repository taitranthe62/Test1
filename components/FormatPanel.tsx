import React from 'react';
import { SlideElement } from '../types';
import { FONT_FACES } from '../constants';
import { AlignLeftIcon } from './icons/AlignLeftIcon';
import { AlignCenterIcon } from './icons/AlignCenterIcon';
import { AlignRightIcon } from './icons/AlignRightIcon';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EmojiIcon } from './icons/EmojiIcon';
import { BringForwardIcon } from './icons/BringForwardIcon';
import { SendBackwardIcon } from './icons/SendBackwardIcon';
import { XIcon } from './icons/XIcon';

interface FormatPanelProps {
  element: SlideElement | null;
  onUpdateElement: (id: string, newElement: Partial<SlideElement>) => void;
  onUpdateStyle: (id: string, newStyle: React.CSSProperties) => void;
  onDelete: (id: string) => void;
  onMoveLayer: (id: string, direction: 'forward' | 'backward') => void;
  slideBackgroundColor: string;
  onUpdateSlideBackground: (color: string) => void;
  onShowEmojiPicker: () => void;
  onClose: () => void;
}

const FormatPanel: React.FC<FormatPanelProps> = ({ 
    element, 
    onUpdateStyle, 
    onDelete, 
    onMoveLayer,
    slideBackgroundColor, 
    onUpdateSlideBackground, 
    onShowEmojiPicker,
    onClose
}) => {

  const handleStyleChange = (property: keyof React.CSSProperties, value: any) => {
    if (element) {
      onUpdateStyle(element.id, { [property]: value });
    }
  };

  const toggleStyle = (property: keyof React.CSSProperties, value1: any, value2: any) => {
    if (!element) return;
    if (element.style[property] === value1) {
        handleStyleChange(property, value2);
    } else {
        handleStyleChange(property, value1);
    }
  }

  return (
    <div className="absolute top-4 right-4 w-72 bg-white shadow-lg z-20 p-4 rounded-lg border border-gray-200 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="font-semibold text-sm text-gray-700">Formatting</h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                <XIcon size={20} />
            </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide Background</label>
                <input
                    type="color"
                    value={slideBackgroundColor}
                    onChange={(e) => onUpdateSlideBackground(e.target.value)}
                    className="w-full h-8 p-0 border-none cursor-pointer rounded-md"
                />
            </div>

            {element && <div className="h-px bg-gray-200"></div>}

            {element && (
                 <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Layer</label>
                    <div className="flex space-x-1">
                        <button onClick={() => onMoveLayer(element.id, 'backward')} className="flex-1 p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Send Backward"><SendBackwardIcon /></button>
                        <button onClick={() => onMoveLayer(element.id, 'forward')} className="flex-1 p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Bring Forward"><BringForwardIcon /></button>
                    </div>
                </div>
            )}
            
            {element?.type === 'TEXT' && (
                <>
                    <div>
                        <label htmlFor="font-family" className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                        <select
                            id="font-family"
                            value={element.style.fontFamily}
                            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {FONT_FACES.map(font => (
                                <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                            <input
                                type="number"
                                value={parseInt(element.style.fontSize?.toString() || '16')}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                            <input
                                type="color"
                                value={element.style.color?.toString() || '#000000'}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Style</label>
                        <div className="flex space-x-1">
                            <button onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} className={`p-2 rounded-md ${element.style.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><BoldIcon /></button>
                            <button onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} className={`p-2 rounded-md ${element.style.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><ItalicIcon /></button>
                            <button onClick={() => toggleStyle('textDecoration', 'underline', 'none')} className={`p-2 rounded-md ${element.style.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><UnderlineIcon /></button>
                            <button onClick={onShowEmojiPicker} className="p-2 rounded-md hover:bg-gray-100"><EmojiIcon /></button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Alignment</label>
                        <div className="flex space-x-1">
                            <button onClick={() => handleStyleChange('textAlign', 'left')} className={`p-2 rounded-md ${element.style.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignLeftIcon /></button>
                            <button onClick={() => handleStyleChange('textAlign', 'center')} className={`p-2 rounded-md ${element.style.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignCenterIcon /></button>
                            <button onClick={() => handleStyleChange('textAlign', 'right')} className={`p-2 rounded-md ${element.style.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignRightIcon /></button>
                        </div>
                    </div>
                </>
            )}
            
            {element && onDelete && (
                <>
                <div className="h-px bg-gray-200"></div>
                <button
                    onClick={() => onDelete(element.id)}
                    className="w-full flex items-center justify-center space-x-2 mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Element</span>
                </button>
                </>
            )}

            {!element && (
                <div className="text-center text-xs text-gray-500 py-4">
                    Select an element on the slide to see its formatting options.
                </div>
            )}
        </div>
    </div>
  );
};

export default FormatPanel;