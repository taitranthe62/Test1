import React from 'react';
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

interface ToolbarProps {
  onAddSlide: () => void;
  onAddElement: (type: 'TEXT' | 'IMAGE' | 'EMOJI') => void;
  onPresent: () => void;
  onShowTemplates: () => void;
  onSave: () => void;
  onLoad: () => void;
  onGenerate: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
}

const ToolbarButton: React.FC<{ onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode }> = ({ onClick, title, disabled, children }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-150 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        title={title}
        disabled={disabled}
    >
        {children}
    </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ onAddSlide, onAddElement, onPresent, onShowTemplates, onSave, onLoad, onGenerate, isGenerating, onDownload, isDownloading }) => {
  return (
    <div className="bg-white shadow-md p-2 flex items-center justify-between z-10 border-b border-gray-200">
      <div className="flex items-center space-x-1">
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
        <ToolbarButton onClick={onGenerate} title="Generate with AI" disabled={isGenerating || isDownloading}>
          <MagicIcon />
        </ToolbarButton>
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        <ToolbarButton onClick={onAddSlide} title="Add Blank Slide">
          <PlusIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onShowTemplates} title="Add from Template">
          <LayoutIcon />
        </ToolbarButton>
        <div className="h-6 border-l border-gray-300 mx-2"></div>
        <ToolbarButton onClick={() => onAddElement('TEXT')} title="Add Text">
            <TextIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => onAddElement('IMAGE')} title="Add Image">
          <ImageIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => onAddElement('EMOJI')} title="Add Emoji">
          <EmojiIcon />
        </ToolbarButton>
      </div>
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