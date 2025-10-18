import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../constants';
import { XIcon } from './icons/XIcon';
import { GoogleGenAI, Modality } from '@google/genai';

interface ImageGalleryProps {
  onSelectImage: (src: string) => void;
  onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onSelectImage, onClose }) => {
  const [images, setImages] = useState<Record<string, string[]>>(GALLERY_IMAGES);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoryNames = Object.keys(images);
  const [activeCategory, setActiveCategory] = useState(categoryNames[0]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          setImages(prevImages => ({
              ...prevImages,
              [activeCategory]: [imageUrl, ...prevImages[activeCategory]]
          }));
          setPrompt('');
          break; 
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 z-30" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="font-semibold">Image Gallery</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
              <XIcon size={20} />
          </button>
        </div>

        <div className="mb-4 flex-shrink-0">
            <label htmlFor="image-prompt" className="text-sm font-medium text-gray-700 block mb-1">Generate Image with AI</label>
            <textarea
              id="image-prompt"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A robot holding a red skateboard"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
        </div>
        
        <div className="border-t pt-4 flex-grow overflow-y-auto">
          {/* Category Tabs */}
            <div className="border-b border-gray-200 mb-2 flex-shrink-0 overflow-x-auto">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {categoryNames.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`${
                                category === activeCategory
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                        >
                            {category}
                        </button>
                    ))}
                </nav>
            </div>
          <div className="grid grid-cols-2 gap-2">
              {images[activeCategory].map((src, index) => (
              <div key={index} className="cursor-pointer group relative" onClick={() => onSelectImage(src)}>
                  <img src={src} alt={`Sample ${index + 1}`} className="w-full h-24 object-cover rounded hover:opacity-80 transition-opacity" />
              </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;