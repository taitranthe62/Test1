import React from 'react';

export const TextIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M4 7h16M4 7v10a2 2 0 002 2h4M12 21V11m0 0H8m4 0h4" />
    </svg>
);