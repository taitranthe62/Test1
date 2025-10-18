import React, { useState, useMemo } from 'react';
import { SlideTemplate } from '../types';
import { SLIDE_TEMPLATES } from '../templates';
import { XIcon } from './icons/XIcon';
import { ImageIcon } from './icons/ImageIcon';

interface TemplateGalleryProps {
  onSelectTemplate: (template: SlideTemplate) => void;
  onClose: () => void;
}

// Template categories for filtering
const TEMPLATE_CATEGORIES = {
  all: 'All Templates',
  title: 'Title Slides',
  content: 'Content Layouts',
  math: 'Mathematical',
  visual: 'Visual & Images',
  special: 'Special Purpose',
};

const TemplatePreview: React.FC<{ template: SlideTemplate, onSelect: () => void }> = ({ template, onSelect }) => {
    const scale = 0.18;
    const previewWidth = 1280 * scale;
    const previewHeight = 720 * scale;

    // Get category badge
    const getCategoryBadge = (type: string) => {
      if (type.includes('math') || type.includes('theorem') || type.includes('equation') || type.includes('derivation') || type.includes('definition')) {
        return <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">Math</span>;
      }
      if (type.includes('title')) {
        return <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-10">Title</span>;
      }
      if (type.includes('image') || type.includes('visual')) {
        return <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full z-10">Visual</span>;
      }
      return null;
    };

    return (
      <div className="flex flex-col items-center group">
        <div 
          onClick={onSelect}
          className="w-full aspect-[16/9] border-2 rounded-lg cursor-pointer relative overflow-hidden transition-all bg-white hover:border-blue-500 hover:shadow-lg hover:scale-105"
          style={{ height: previewHeight, width: previewWidth }}
        >
          {getCategoryBadge(template.type)}
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
        <p className="text-sm mt-2 text-gray-700 font-medium group-hover:text-blue-600">{template.name}</p>
      </div>
    );
};

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let templates = SLIDE_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => {
        const type = template.type;
        switch (selectedCategory) {
          case 'title':
            return type.includes('title');
          case 'content':
            return type.includes('content') || type.includes('agenda') || type.includes('timeline') || type.includes('comparison');
          case 'math':
            return type.includes('math') || type.includes('theorem') || type.includes('equation') || type.includes('derivation') || type.includes('definition');
          case 'visual':
            return type.includes('image') || type.includes('quote') || type.includes('statement');
          case 'special':
            return type.includes('statistic') || type.includes('conclusion') || type.includes('section');
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Choose a Template</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredTemplates.length} templates available</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white hover:shadow transition-all">
            <XIcon size={24} />
          </button>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="p-4 border-b bg-gray-50">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <TemplatePreview
                  key={template.name}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">No templates found</p>
              <p className="text-sm mt-2">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;