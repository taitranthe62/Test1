import React from 'react';
import { SlideTemplate } from '../types';
import { SLIDE_TEMPLATES } from '../templates';
import { XIcon } from './icons/XIcon';
import { ImageIcon } from './icons/ImageIcon';

interface TemplateGalleryProps {
  onSelectTemplate: (template: SlideTemplate) => void;
  onClose: () => void;
}

const TemplatePreview: React.FC<{ template: SlideTemplate, onSelect: () => void }> = ({ template, onSelect }) => {
    const scale = 0.18;
    const previewWidth = 1280 * scale;
    const previewHeight = 720 * scale;

    return (
      <div className="flex flex-col items-center">
        <div 
          onClick={onSelect}
          className="w-full aspect-[16/9] border-2 rounded-md cursor-pointer relative overflow-hidden transition-all bg-white hover:border-blue-500"
          style={{ height: previewHeight, width: previewWidth }}
        >
          <div 
              className="absolute top-0 left-0"
              style={{ 
                  width: `calc(100% / ${scale})`,
                  height: `calc(100% / ${scale})`,
                  transform: `scale(${scale})`, 
                  transformOrigin: 'top left', 
                  backgroundColor: template.backgroundColor,
                  pointerEvents: 'none'
              }}
          >
              {template.elements.map((element, index) => {
                  const elementStyle: React.CSSProperties = {
                      ...element.style,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                  };
                  return (
                      <div key={index} style={elementStyle}>
                          {element.type === 'TEXT' ? (
                              <p>{element.content}</p>
                          ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ImageIcon className="w-1/4 h-1/4 text-gray-400" />
                              </div>
                          )}
                      </div>
                  )
              })}
          </div>
        </div>
        <p className="text-sm mt-2 text-gray-600">{template.name}</p>
      </div>
    );
};

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Choose a Template</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XIcon size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SLIDE_TEMPLATES.map((template) => (
              <TemplatePreview
                key={template.name}
                template={template}
                onSelect={() => onSelectTemplate(template)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;