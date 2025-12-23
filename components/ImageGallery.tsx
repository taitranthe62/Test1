
import React, { useState } from 'react';
import { GALLERY_IMAGES } from '../constants';
import { XIcon } from './icons/XIcon';
import { GoogleGenAI } from '@google/genai';

interface ImageGalleryProps {
  onSelectImage: (src: string) => void;
  onClose: () => void;
  inline?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onSelectImage, onClose, inline = false }) => {
  const [images, setImages] = useState<Record<string, string[]>>(GALLERY_IMAGES);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoryNames = Object.keys(images);
  const [activeCategory, setActiveCategory] = useState(categoryNames[0]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    // Key selection logic for high quality image models
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        await window.aistudio.openSelectKey();
    }

    setIsLoading(true);

    try {
      // Create a new instance right before use to ensure latest key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Native generation with Flash
        contents: {
          parts: [{ text: prompt }]
        }
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setImages(prevImages => ({
              ...prevImages,
              [activeCategory]: [imageUrl, ...prevImages[activeCategory]]
          }));
          setPrompt('');
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("AI did not return any images in the response parts.");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      if (error.message?.includes("Requested entity was not found")) {
          alert("Selected API key project not found or billing not enabled. Please select a valid paid project.");
          await window.aistudio.openSelectKey();
      } else {
          alert("Failed to generate image. " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className={`flex flex-col h-full bg-white rounded-xl ${inline ? '' : 'absolute top-0 right-0 w-80 bg-white shadow-2xl p-4 ring-1 ring-black/5'}`}>
      {!inline && (
        <div className="flex justify-between items-center mb-5 flex-shrink-0">
          <h3 className="font-extrabold text-slate-800 tracking-tight">Image Suite</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <XIcon size={20} />
          </button>
        </div>
      )}

      <div className="mb-6 flex-shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label htmlFor="image-prompt" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">AI Visual Studio</label>
          <div className="relative">
            <textarea
              id="image-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you imagine..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm resize-none transition-all"
              disabled={isLoading}
            />
            <button
                onClick={handleGenerateImage}
                disabled={isLoading || !prompt.trim()}
                className="w-full mt-3 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-all text-xs font-bold shadow-lg shadow-black/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </span>
                ) : 'Generate Custom Image'}
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 text-center font-medium">Powered by Gemini Visual Intelligence</p>
      </div>
      
      <div className="flex-grow overflow-hidden flex flex-col">
          <div className="mb-4 flex-shrink-0 overflow-x-auto border-b border-slate-100 flex items-center px-1">
              <nav className="flex space-x-6 h-full" aria-label="Tabs">
                  {categoryNames.map((category) => (
                      <button
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          className={`${
                              category === activeCategory
                                  ? 'border-blue-600 text-blue-600'
                                  : 'border-transparent text-slate-400 hover:text-slate-600'
                          } whitespace-nowrap py-3 px-1 border-b-2 font-bold text-[10px] uppercase tracking-tighter transition-all`}
                      >
                          {category}
                      </button>
                  ))}
              </nav>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-2 gap-3 pb-4">
                {images[activeCategory].map((src, index) => (
                <div 
                    key={index} 
                    className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03]" 
                    onClick={() => onSelectImage(src)}
                >
                    <img src={src} alt={`Visual ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
                </div>
                ))}
            </div>
          </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-all flex justify-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="h-full w-96 animate-slide-in">
        {content}
      </div>
    </div>
  );
};

export default ImageGallery;
