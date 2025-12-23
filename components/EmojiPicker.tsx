import React, { useState } from 'react';
import { EMOJI_CATEGORIES } from '../constants';
import { XIcon } from './icons/XIcon';

interface EmojiPickerProps {
    onSelectEmoji: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
    const categoryNames = Object.keys(EMOJI_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState(categoryNames[0]);

    const activeEmojis = EMOJI_CATEGORIES[activeCategory];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-30" onClick={onClose}>
            <div 
                className="absolute top-4 right-[19rem] w-80 h-auto max-h-[calc(100%-2rem)] bg-white shadow-xl p-4 rounded-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="font-semibold">Emoji Picker</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <XIcon size={20} />
                    </button>
                </div>
                
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
                
                {/* Emoji Grid */}
                <div className="grid grid-cols-8 gap-2 overflow-y-auto flex-grow">
                    {activeEmojis.map((emoji, index) => (
                        <button
                            key={`${activeCategory}-${index}`}
                            onClick={() => onSelectEmoji(emoji)}
                            className="text-2xl rounded-lg hover:bg-gray-200 p-1"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;