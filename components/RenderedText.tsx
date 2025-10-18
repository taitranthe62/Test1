import React, { useEffect, useRef } from 'react';

// Define the KaTeX auto-render function and its core dependency on the window object for TypeScript
declare global {
    interface Window {
        renderMathInElement?: (element: HTMLElement, options: any) => void;
        katex?: any; // The main KaTeX object
    }
}

interface RenderedTextProps {
  content: string;
  style: React.CSSProperties;
}

const RenderedText: React.FC<RenderedTextProps> = ({ content, style }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the KaTeX library, its core object, and the auto-render function are all available.
    // This prevents a race condition where the auto-render script has loaded but the main KaTeX object hasn't fully initialized.
    if (ref.current && window.renderMathInElement && window.katex) {
      try {
        // Use KaTeX's auto-render extension to find and render math
        window.renderMathInElement(ref.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
          ],
          // Prevents the app from crashing if the AI generates invalid LaTeX
          throwOnError: false
        });
      } catch (e) {
        console.error("KaTeX rendering error:", e);
      }
    }
  }, [content]); // Re-run the effect whenever the text content changes

  // Initially render the HTML content, which KaTeX will then process
  return <div ref={ref} style={style} dangerouslySetInnerHTML={{ __html: content }} />;
};

export default RenderedText;