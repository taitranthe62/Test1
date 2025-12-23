import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { MagicIcon } from './icons/MagicIcon';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PresentationIcon } from './icons/PresentationIcon';

export type DetailLevel = 'concise' | 'balanced' | 'detailed';

interface AIGenerationModalProps {
    onGenerate: (topic: string, file: File | null, detailLevel: DetailLevel, isStudyDeck: boolean) => void;
    onClose: () => void;
    isGenerating: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_FILE_TYPES = '.txt,.md,.pdf,.png,.jpg,.jpeg,.webp';

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ onGenerate, onClose, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [detailLevel, setDetailLevel] = useState<DetailLevel>('balanced');
    const [isStudyDeck, setIsStudyDeck] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
            setFile(null);
            return;
        }

        setError(null);
        setFile(selectedFile);
    };

    const canGenerate = (topic.trim() !== '' || file !== null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canGenerate || isGenerating) return;
        onGenerate(topic, file, detailLevel, isStudyDeck);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <MagicIcon />
                        <span className="ml-2">Generate with AI</span>
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                        <XIcon size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                                <button type="button" onClick={() => setIsStudyDeck(false)} className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isStudyDeck ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                                    <PresentationIcon className={`w-6 h-6 mb-1 ${!isStudyDeck ? 'text-blue-500' : 'text-gray-600'}`} />
                                    <span className={`font-medium text-sm ${!isStudyDeck ? 'text-gray-900' : 'text-gray-600'}`}>Presentation</span>
                                </button>
                                <button type="button" onClick={() => setIsStudyDeck(true)} className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isStudyDeck ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                                    <BookOpenIcon className={`w-6 h-6 mb-1 ${isStudyDeck ? 'text-blue-500' : 'text-gray-600'}`} />
                                    <span className={`font-medium text-sm ${isStudyDeck ? 'text-gray-900' : 'text-gray-600'}`}>Study Deck</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                                Topic {!file && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={isStudyDeck ? "e.g., The Principles of Quantum Mechanics" : "e.g., The Future of Renewable Energy"}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required={!file}
                                disabled={isGenerating}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Required if no document is provided. If left blank, a topic will be inferred from the document.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Detail Level</label>
                            <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
                                {(['concise', 'balanced', 'detailed'] as DetailLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setDetailLevel(level)}
                                        className={`w-full rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                                            ${detailLevel === level
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'bg-transparent text-gray-600 hover:bg-white/60'
                                            }`}
                                        disabled={isGenerating}
                                    >
                                        <span className="capitalize">{level}</span>
                                        <span className="block text-xs text-gray-500">
                                            {level === 'concise' && `Fewer ${isStudyDeck ? 'Cards' : 'Slides'}`}
                                            {level === 'balanced' && 'Default'}
                                            {level === 'detailed' && `More ${isStudyDeck ? 'Cards' : 'Slides'}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Optional: Provide Document/Book
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ACCEPTED_FILE_TYPES} disabled={isGenerating} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Text, Image, or PDF up to 50MB</p>
                                </div>
                            </div>
                             {file && (
                                <div className="mt-2 text-sm text-gray-700 flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                    <span>{file.name}</span>
                                    <button type="button" onClick={() => setFile(null)} disabled={isGenerating} className="text-gray-500 hover:text-red-500">
                                        <XCircleIcon />
                                    </button>
                                </div>
                            )}
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                        <button
                            type="submit"
                            disabled={!canGenerate || isGenerating}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isGenerating}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIGenerationModal;