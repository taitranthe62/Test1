import React, { useState, useEffect, useRef, useContext } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { ImageIcon } from './icons/ImageIcon';
import { PlayIcon } from './icons/PlayIcon';
import { EmojiIcon } from './icons/EmojiIcon';
import { LayoutIcon } from './icons/LayoutIcon';
import { TextIcon } from './icons/TextIcon';
import { SaveIcon } from './icons/SaveIcon';
import { LoadIcon } from './icons/LoadIcon';
import { MagicIcon } from './icons/MagicIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShapeIcon } from './icons/ShapeIcon';
import { IconLibraryIcon } from './icons/IconLibraryIcon';
import { TableIcon } from './icons/TableIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChartIcon } from './icons/ChartIcon';
import { PresentationContext } from '../presentationContext';
import { ActionTypes } from '../actions';

type ElementType = 'TEXT' | 'IMAGE' | 'EMOJI' | 'SHAPE' | 'ICON' | 'TABLE' | 'CHART';

interface ToolbarProps {
  onAddElement: (type: ElementType) => void;
  onPresent: () => void;
  onShowTemplates: () => void;
  onSave: () => void;
  onLoad: () => void;
  onGenerate: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
}

const ToolbarButton: React.FC<{ onClick?: () => void; title: string; disabled?: boolean; children: React.ReactNode }> = ({ onClick, title, disabled, children }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-150 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        title={title}
        disabled={disabled}
    >
        {children}
    </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ onAddElement, onPresent, onShowTemplates, onSave, onLoad, onGenerate, isGenerating, onDownload, isDownloading }) => {
    const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
    const insertMenuRef = useRef<HTMLDivElement>(null);
    const { dispatch } = useContext(PresentationContext);
    
    // Fix: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    const insertableElements: {type: ElementType, label: string, icon: React.ReactNode}[] = [
        { type: 'TEXT', label: 'Text', icon: <TextIcon /> },
        { type: 'IMAGE', label: 'Image', icon: <ImageIcon /> },
        { type: 'SHAPE', label: 'Shape', icon: <ShapeIcon /> },
        { type: 'ICON', label: 'Icon', icon: <IconLibraryIcon /> },
        { type: 'TABLE', label: 'Table', icon: <TableIcon /> },
        { type: 'CHART', label: 'Chart', icon: <ChartIcon /> },
        { type: 'EMOJI', label: 'Emoji', icon: <EmojiIcon /> },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (insertMenuRef.current && !insertMenuRef.current.contains(event.target as Node)) {
                setIsInsertMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
  return (
    <div className="bg-white shadow-md p-2 flex items-center justify-between z-10 border-b border-gray-200">
      <div className="flex items-center space-x-1">
        {/* File Group */}
        <ToolbarButton onClick={onSave} title="Save Presentation">
          <SaveIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onLoad} title="Load Presentation">
          <LoadIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onDownload} title="Download as PDF" disabled={isDownloading}>
          <DownloadIcon />
        </ToolbarButton>
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        {/* AI Group */}
        <ToolbarButton onClick={onGenerate} title="Generate with AI" disabled={isGenerating || isDownloading}>
          <MagicIcon />
        </ToolbarButton>
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        {/* Slide Management Group */}
        <button onClick={() => dispatch({ type: ActionTypes.ADD_SLIDE })} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150 text-sm font-medium">
          <PlusIcon />
          <span>Add Slide</span>
        </button>
        <ToolbarButton onClick={onShowTemplates} title="Add from Template">
          <LayoutIcon />
        </ToolbarButton>
        
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        
        {/* Element Insertion Group */}
        <div className="relative" ref={insertMenuRef}>
            <button
                onClick={() => setIsInsertMenuOpen(prev => !prev)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150 text-sm font-medium"
            >
                <span>Add Element</span>
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isInsertMenuOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-20">
                    {insertableElements.map(item => (
                        <button
                            key={item.type}
                            onClick={() => {
                                onAddElement(item.type);
                                setIsInsertMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 text-left p-2 rounded-md hover:bg-gray-100 text-gray-700"
                        >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {/* Presentation Group */}
      <div className="flex items-center space-x-2">
        <button onClick={onPresent} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 text-sm font-medium">
          <PlayIcon />
          <span>Present</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;