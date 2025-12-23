import React from 'react';
import { PresentationState } from './types';
import { Action } from './actions';

export interface PresentationContextType {
  state: PresentationState;
  dispatch: React.Dispatch<Action>;
}

// Provide a non-null default value that matches the context's shape.
// This is primarily for type-safety; the actual value will be provided by the Provider.
const defaultContextValue: PresentationContextType = {
  state: {
    slides: [],
    currentSlideId: null,
    selectedElementId: null,
    currentSlide: undefined,
    selectedElement: undefined,
  },
  dispatch: () => { 
    // This default dispatch does nothing, ensuring the app doesn't crash
    // if a component accidentally uses the context without a Provider.
    console.warn('Dispatch called without a PresentationContext.Provider.');
  },
};

export const PresentationContext = React.createContext<PresentationContextType>(defaultContextValue);
