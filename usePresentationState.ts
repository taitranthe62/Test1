
import { useReducer, useEffect, useMemo, useState } from 'react';
import { PresentationState, Slide } from './types';
import { Action, ActionTypes } from './actions';
import { presentationReducer } from './presentationReducer';
import { saveSlides, loadSlides } from './db';

// Fix: Added missing 'layout' property to satisfy the Slide type requirements.
const initialSlide: Slide = {
  id: 'slide-initial',
  layout: 'title',
  elements: [
    {
      type: 'TEXT',
      id: 'element-title',
      content: 'Welcome to Your Presentation!',
      style: {
        position: 'absolute', left: '10%', top: '35%', width: '80%', height: 'auto',
        fontSize: '38px', fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', fontFamily: '"Montserrat", sans-serif',
      },
    },
    {
      type: 'TEXT',
      id: 'element-subtitle',
      content: 'Use the toolbar above to get started.',
      style: {
        position: 'absolute', left: '10%', top: '55%', width: '80%', height: 'auto',
        fontSize: '19px', textAlign: 'center', color: '#555555', fontFamily: '"Lato", sans-serif',
      },
    },
  ],
  background: { color: '#fdfdfd', primaryTextColor: '#1a1a1a', secondaryTextColor: '#555555' },
};


const getInitialState = (): PresentationState => {
    return {
        version: 1,
        slides: [initialSlide],
        currentSlideId: initialSlide.id,
        selectedElementId: null,
    };
};


export const usePresentationState = () => {
    const [state, dispatch] = useReducer(presentationReducer, getInitialState());
    const [isDbLoaded, setIsDbLoaded] = useState(false); // Track initial load

    // Load from IndexedDB on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const savedSlides = await loadSlides();
                if (savedSlides && Array.isArray(savedSlides) && savedSlides.length > 0) {
                    dispatch({ type: ActionTypes.LOAD_SLIDES, payload: { slides: savedSlides } });
                }
            } catch (error) {
                console.error("Failed to load slides from IndexedDB on init:", error);
                // App will proceed with the default initial state
            } finally {
                setIsDbLoaded(true);
            }
        };
        loadInitialData();
    }, []); // Empty array ensures this runs only once on mount

    // Auto-save to IndexedDB whenever slides change
    useEffect(() => {
        if (!isDbLoaded) {
            return; // Don't save until the initial data has been loaded
        }
        
        const isDefaultState = state.slides.length === 1 && state.slides[0].id === 'slide-initial';
        const isEmptyState = state.slides.length === 0;

        if (!isDefaultState && !isEmptyState) {
            saveSlides(state.slides).catch(error => {
                console.error("Auto-save to IndexedDB failed:", (error as Error).message);
            });
        }

    }, [state.slides, isDbLoaded]);
    
    // Derive computed state here to avoid re-calculating in every component
    const derivedState = useMemo(() => {
        const currentSlide = state.slides.find(s => s.id === state.currentSlideId);
        const selectedElement = currentSlide?.elements.find(e => e.id === state.selectedElementId);
        return {
            ...state,
            currentSlide,
            selectedElement
        };
    }, [state]);

    return { state: derivedState, dispatch };
};
