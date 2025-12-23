// Fix: Added full content for ItalicIcon.tsx to provide the icon.
import React from 'react';

export const ItalicIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h6M7 20h6M12 4L8 20" />
    </svg>
);
