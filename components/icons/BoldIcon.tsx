// Fix: Added full content for BoldIcon.tsx to provide the icon.
import React from 'react';

export const BoldIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h5.5a3.5 3.5 0 010 7H6v5h6.5a3.5 3.5 0 010 7H6V4z" />
    </svg>
);
