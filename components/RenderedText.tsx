
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
                    throwOnError: false
                });
            } catch (e) {
                console.error("KaTeX rendering error:", e);
            }
        } else if (retryCount.current < 20) {
            // Thử lại sau 100ms nếu KaTeX chưa sẵn sàng (tối đa 2 giây)
            retryCount.current++;
            setTimeout(renderMath, 100);
        }
    };

    renderMath();
  }, [cleanContent]);

  return <div ref={ref} style={style} dangerouslySetInnerHTML={{ __html: cleanContent }} />;
};

export default RenderedText;
