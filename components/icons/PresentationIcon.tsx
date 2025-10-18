import React from 'react';

export const PresentationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m16 0v2a4 4 0 01-4 4H6a4 4 0 01-4-4v-2m16 0h-2M4 12H2m12-4V4m0 16v-4" />
    </svg>
);
