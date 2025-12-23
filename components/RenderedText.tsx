
import React, { useEffect, useRef } from 'react';
import { sanitizeHtml } from '../utils';

declare global {
    interface Window {
        renderMathInElement?: (element: HTMLElement, options: any) => void;
        katex?: any;
    }
}

interface RenderedTextProps {
  content: string;
  style: React.CSSProperties;
}

const RenderedText: React.FC<RenderedTextProps> = ({ content, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const retryCount = useRef(0);
  
  // Sanitize content before rendering
  const cleanContent = sanitizeHtml(content);

  useEffect(() => {
    // CRITICAL FIX: Reset retry count when content changes to ensure new math is rendered
    retryCount.current = 0;

    const renderMath = () => {
        if (ref.current && window.renderMathInElement && window.katex) {
            try {
                window.renderMathInElement(ref.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                    ],
                    throwOnError: false, // Don't crash on bad latex
                    strict: false,       // Be lenient with warnings
                    errorColor: '#cc0000' // Highlight errors visually
                });
            } catch (e) {
                console.error("KaTeX rendering error:", e);
            }
        } else if (retryCount.current < 50) {
            // Retry up to 50 times (5 seconds) to allow KaTeX from CDN to load on slow connections
            retryCount.current++;
            setTimeout(renderMath, 100);
        }
    };

    renderMath();
  }, [cleanContent]);

  return <div ref={ref} style={style} dangerouslySetInnerHTML={{ __html: cleanContent }} />;
};

export default RenderedText;
