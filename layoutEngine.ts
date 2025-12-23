import React from 'react';

/**
 * The LayoutEngine provides standardized methods for calculating element positions 
 * and responsive styles within the 1280x720 coordinate space.
 */
export const LayoutEngine = {
  /**
   * Generates a standard absolute positioning style object.
   */
  getAbsoluteStyle: (
    top: string | number, 
    left: string | number, 
    width: string | number, 
    height: string | number = 'auto'
  ): React.CSSProperties => {
    return {
      position: 'absolute',
      top,
      left,
      width,
      height,
      boxSizing: 'border-box'
    };
  },

  /**
   * Helper for center alignment in a container.
   */
  getCenteredStyle: (width: string, top: string): React.CSSProperties => {
    return {
      position: 'absolute',
      left: '50%',
      top,
      width,
      transform: 'translateX(-50%)',
      textAlign: 'center'
    };
  },

  /**
   * Normalizes values to percentage strings if they are numbers.
   */
  toPercent: (val: number | string): string => {
    if (typeof val === 'number') return `${val}%`;
    return val;
  },

  /**
   * Pre-defined area constants for common layouts.
   */
  Areas: {
    FULL_TITLE: { left: '10%', top: '35%', width: '80%', height: 'auto' },
    HEADER: { left: '8%', top: '8%', width: '84%', height: '15%' },
    BODY_FULL: { left: '8%', top: '25%', width: '84%', height: '65%' },
    LEFT_COLUMN: { left: '8%', top: '25%', width: '40%', height: '65%' },
    RIGHT_COLUMN: { left: '52%', top: '25%', width: '40%', height: '65%' },
    CENTER_FOCUS: { left: '15%', top: '25%', width: '70%', height: '55%' }
  }
};
