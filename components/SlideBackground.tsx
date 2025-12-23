
import React from 'react';
import { BackgroundDefinition } from '../types';

interface SlideBackgroundProps {
  background: BackgroundDefinition;
}

const SlideBackground: React.FC<SlideBackgroundProps> = ({ background }) => {
  if (!background) {
    return <div className="absolute inset-0 bg-white" />;
  }
  
  const baseStyle: React.CSSProperties = {
    background: background.color,
  };

  const patternStyle: React.CSSProperties = background.pattern ? {
    backgroundImage: `url("${background.pattern}")`,
    opacity: 0.05,
    mixBlendMode: 'multiply'
  } : {};

  return (
    <div className="absolute inset-0 overflow-hidden" style={baseStyle}>
        {background.pattern && (
            <div className="absolute inset-0" style={patternStyle} />
        )}
    </div>
  );
};

export default SlideBackground;
