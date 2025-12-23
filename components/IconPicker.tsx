
import React, { useState } from 'react';
import { ICON_LIBRARY, IconComponent } from './icons/library';
import { XIcon } from './icons/XIcon';

interface IconPickerProps {
    onSelectIcon: (iconName: string) => void;
    onClose: () => void;
    inline?: boolean;
}

const IconPicker: React.FC<IconPickerProps> = ({ onSelectIcon, onClose, inline = false }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = Object.keys(ICON_LIBRARY).filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const content = (
        <div className={`flex flex-col h-full ${inline ? '' : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white shadow-xl p-4 rounded-lg'}`}>
            {!inline && (
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="font-semibold">Select an Icon</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <XIcon size={20} />
                    </button>
                </div>
            )}
            
            <div className="mb-4 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                />
            </div>
            
            <div className="grid grid-cols-4 gap-2 overflow-y-auto flex-grow p-1 custom-scrollbar">
                {filteredIcons.map(iconName => (
                    <button
                        key={iconName}
                        onClick={() => onSelectIcon(iconName)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 aspect-square transition-all group border border-transparent hover:border-blue-200"
                        title={iconName}
                    >
                        <IconComponent iconName={iconName} className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                        <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center group-hover:text-blue-500">{iconName}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    if (inline) return content;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="h-full">
                {content}
            </div>
        </div>
    );
};

export default IconPicker;
