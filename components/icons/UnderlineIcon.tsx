// Fix: Added full content for UnderlineIcon.tsx to provide the icon.
import React from 'react';

export const UnderlineIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v7a6 6 0 0012 0V4m-3 16h-6" />
    </svg>
);
