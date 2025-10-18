import React from 'react';
import { XIcon } from './icons/XIcon';

interface AILoadingModalProps {
    status: 'idle' | 'loading' | 'error';
    message: string;
    onClose: () => void;
}

const AILoadingModal: React.FC<AILoadingModalProps> = ({ status, message, onClose }) => {
    if (status === 'idle') {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-lg font-semibold text-gray-800">Generating...</h2>
                        <p className="text-sm text-gray-600 mt-2">{message}</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-4">
                            <XIcon size={28} className="text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">An Error Occurred</h2>
                        <p className="text-sm text-gray-600 mt-2">{message}</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AILoadingModal;
