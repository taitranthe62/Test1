import React, { useState } from 'react';

interface TableCreatorModalProps {
    onCreate: (rows: number, cols: number) => void;
    onClose: () => void;
}

const MAX_ROWS = 8;
const MAX_COLS = 10;

const TableCreatorModal: React.FC<TableCreatorModalProps> = ({ onCreate, onClose }) => {
    const [selection, setSelection] = useState({ rows: 1, cols: 1 });

    const handleSelect = () => {
        onCreate(selection.rows, selection.cols);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-md font-medium text-center mb-2">
                    Create Table: {selection.rows} &times; {selection.cols}
                </h3>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }} onMouseLeave={() => setSelection({rows: 1, cols: 1})}>
                    {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, index) => {
                        const row = Math.floor(index / MAX_COLS) + 1;
                        const col = (index % MAX_COLS) + 1;
                        const isSelected = row <= selection.rows && col <= selection.cols;

                        return (
                            <div
                                key={index}
                                onMouseEnter={() => setSelection({ rows: row, cols: col })}
                                onClick={handleSelect}
                                className={`w-6 h-6 border cursor-pointer rounded-sm transition-colors ${isSelected ? 'bg-blue-500 border-blue-600' : 'bg-gray-100 border-gray-300 hover:bg-blue-200'}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TableCreatorModal;