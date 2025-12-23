import React from 'react';

export const SaveIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-8.172a2 2 0 00-.586-1.414L12 7l-4.414 4.414A2 2 0 007 12.828V21M7 21h10M7 21a2 2 0 01-2-2v-1a2 2 0 012-2h10a2 2 0 012 2v1a2 2 0 01-2 2M15 7v2a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2z" />
    </svg>
);