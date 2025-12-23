
import { v4 as uuidv4 } from 'uuid';
import { PresentationState, Slide, SlideElement, TextElement, ShapeElement, TableElement, ChartElement, ChartData, TemplateElement, TableCell } from './types';
import { Action, ActionTypes } from './actions';
import { THEME_PACKS } from './templates';

const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

const updateCurrentSlideElements = (state: PresentationState, updateFn: (elements: SlideElement[]) => SlideElement[]): Slide[] => {
    if (!state.currentSlideId) return state.slides;
    return state.slides.map(s =>
        s.id === state.currentSlideId
            ? { ...s, elements: updateFn(s.elements) }
            : s
    );
};

export function presentationReducer(state: PresentationState, action: Action): PresentationState {
    switch (action.type) {
        case ActionTypes.ADD_SLIDE: {
            const newSlide: Slide = { 
                id: generateId('slide'), 
                layout: 'content', // Mặc định
                elements: [], 
                background: { color: '#ffffff', primaryTextColor: '#000000', secondaryTextColor: '#333333' } 
            };
            const newSlides = [...state.slides, newSlide];
            return {
                ...state,
                slides: newSlides,
                currentSlideId: newSlide.id,
                selectedElementId: null
            };
        }
        case ActionTypes.ADD_SLIDE_FROM_TEMPLATE: {
            const { template } = action.payload;
            const slideKey = generateId('slide');
            const background = { color: '#ffffff', primaryTextColor: '#000000', secondaryTextColor: '#333333' };
            const theme = THEME_PACKS[0];

            const newElements = template.render({}, theme, background, new Map(), slideKey);

            const newSlide: Slide = {
                id: slideKey,
                layout: template.type,
                background,
                elements: newElements,
            };
            const newSlides = [...state.slides, newSlide];
            return {
                ...state,
                slides: newSlides,
                currentSlideId: newSlide.id,
                selectedElementId: null
            };
        }
        case ActionTypes.ADD_SLIDES_FROM_AI: {
            const { newSlides } = action.payload;
            if (!newSlides || newSlides.length === 0) return state;
            const updatedSlides = [...state.slides, ...newSlides];
            return {
                ...state,
                slides: updatedSlides,
                currentSlideId: newSlides[0].id,
                selectedElementId: null,
            };
        }
        case ActionTypes.DELETE_SLIDE: {
            const newSlides = state.slides.filter(s => s.id !== action.payload.slideId);
            let newCurrentSlideId = state.currentSlideId;
            if (state.currentSlideId === action.payload.slideId) {
                newCurrentSlideId = newSlides.length > 0 ? newSlides[0].id : null;
            }
            return {
                ...state,
                slides: newSlides,
                currentSlideId: newCurrentSlideId,
            };
        }
        case ActionTypes.SELECT_SLIDE:
            return { ...state, currentSlideId: action.payload.slideId, selectedElementId: null };
        case ActionTypes.MOVE_SLIDE: {
            const { dragIndex, hoverIndex } = action.payload;
            const newSlides = [...state.slides];
            const [draggedItem] = newSlides.splice(dragIndex, 1);
            newSlides.splice(hoverIndex, 0, draggedItem);
            return { ...state, slides: newSlides };
        }
        case ActionTypes.UPDATE_SLIDE_BACKGROUND:
            return {
                ...state,
                slides: state.slides.map(s =>
                    s.id === state.currentSlideId
                        ? { ...s, background: action.payload.background }
                        : s
                ),
            };
        case ActionTypes.LOAD_SLIDES: {
             const migratedSlides = action.payload.slides.map(s => {
                if (!s.layout) s.layout = 'content';
                if (typeof s.background === 'string') {
                    return { ...s, background: { color: s.background, primaryTextColor: '#000000', secondaryTextColor: '#333333' } };
                }
                return s as Slide;
            });
            return {
                ...state,
                slides: migratedSlides,
                currentSlideId: migratedSlides[0]?.id || null,
                selectedElementId: null,
            };
        }
        case ActionTypes.SELECT_ELEMENT:
            return { ...state, selectedElementId: action.payload.elementId };
        case ActionTypes.ADD_ELEMENT: {
            let newElement: SlideElement | undefined;
            const { payload } = action;
            switch (payload.type) {
                case 'TEXT': case 'EMOJI':
                     newElement = {
                        id: generateId('element'), type: 'TEXT',
                        content: payload.type === 'EMOJI' ? '😀' : 'New Text',
                        style: { position: 'absolute', left: '40%', top: '40%', width: payload.type === 'EMOJI' ? '10%' : '20%', height: 'auto', fontSize: payload.type === 'EMOJI' ? '64px' : '19px', textAlign: 'center', overflowWrap: 'break-word', overflow: 'hidden' },
                    } as TextElement;
                    break;
                case 'SHAPE':
                    newElement = {
                        id: generateId('element'), type: 'SHAPE', shape: 'RECTANGLE',
                        style: { position: 'absolute', left: '30%', top: '30%', width: '40%', height: '40%', backgroundColor: 'rgba(59, 130, 246, 0.5)' }
                    } as ShapeElement;
                    break;
                case 'TABLE':
                     newElement = {
                        id: generateId('element'), type: 'TABLE', rows: payload.options.rows, columns: payload.options.columns,
                        cellData: Array.from({ length: payload.options.rows }, () => Array.from({ length: payload.options.columns }, () => ({ id: generateId('cell'), content: ``, style: {} }))),
                        style: { position: 'absolute', left: '25%', top: '25%', width: '50%', height: 'auto' }
                    } as TableElement;
                    break;
                case 'CHART':
                    const defaultChartData: ChartData = { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Dataset 1', data: [12, 19, 3], backgroundColor: ['#4ade80', '#facc15', '#f87171'], borderColor: '#3b82f6' }] };
                    newElement = { id: generateId('element'), type: 'CHART', chartType: 'BAR', data: defaultChartData, style: { position: 'absolute', left: '20%', top: '20%', width: '60%', height: '60%' } } as ChartElement;
                    break;
                case 'IMAGE':
                    newElement = { id: generateId('element'), type: 'IMAGE', src: payload.options.src, style: { position: 'absolute', left: '35%', top: '30%', width: '30%', height: '40%', objectFit: 'cover' } };
                    break;
                case 'ICON':
                    newElement = { id: generateId('element'), type: 'ICON', iconName: payload.options.iconName, style: { position: 'absolute', left: '45%', top: '45%', width: '10%', height: '10%', fontSize: '100px', color: '#3b82f6' } };
                    break;
            }
            if (newElement) {
                const newSlides = updateCurrentSlideElements(state, elements => [...elements, newElement!]);
                return { ...state, slides: newSlides, selectedElementId: newElement.id };
            }
            return state;
        }
        case ActionTypes.UPDATE_ELEMENT: {
             const { elementId, newContent, newShape, newIconName } = action.payload;
             const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === elementId) {
                    const updatedElement = { ...e };
                    if (updatedElement.type === 'TEXT' && newContent !== undefined) updatedElement.content = newContent;
                    if (updatedElement.type === 'SHAPE' && newShape) updatedElement.shape = newShape;
                    if (updatedElement.type === 'ICON' && newIconName) updatedElement.iconName = newIconName;
                    return updatedElement;
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.UPDATE_ELEMENT_STYLE: {
             const { elementId, newStyle } = action.payload;
             const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => e.id === elementId ? { ...e, style: { ...e.style, ...newStyle } } : e));
             return { ...state, slides: newSlides };
        }
        case ActionTypes.DELETE_ELEMENT: {
            const newSlides = updateCurrentSlideElements(state, elements => elements.filter(e => e.id !== action.payload.elementId));
            return { ...state, slides: newSlides, selectedElementId: null };
        }
        case ActionTypes.MOVE_ELEMENT_LAYER: {
             const { elementId, direction } = action.payload;
             const newSlides = updateCurrentSlideElements(state, elements => {
                const newElements = [...elements];
                const index = newElements.findIndex(e => e.id === elementId);
                if (index === -1) return newElements;
                if (direction === 'forward' && index < newElements.length - 1) {
                    [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
                } else if (direction === 'backward' && index > 0) {
                    [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
                }
                return newElements;
            });
            return { ...state, slides: newSlides };
        }
        case ActionTypes.UPDATE_TABLE_CELL: {
            const { elementId, rowIndex, colIndex, newContent } = action.payload;
            const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === elementId && e.type === 'TABLE') {
                    const newCellData = e.cellData.map(row => [...row]);
                    newCellData[rowIndex][colIndex] = { ...newCellData[rowIndex][colIndex], content: newContent };
                    return { ...e, cellData: newCellData };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.UPDATE_TABLE_DATA: {
            const { elementId, rows, columns, cellData } = action.payload;
            const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === elementId && e.type === 'TABLE') {
                    return { ...e, rows, columns, cellData };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.ADD_TABLE_ROW: {
             const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === action.payload.elementId && e.type === 'TABLE') {
                    const newRow = Array.from({ length: e.columns }, () => ({ id: generateId('cell'), content: '', style: {} }));
                    return { ...e, rows: e.rows + 1, cellData: [...e.cellData, newRow] };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.REMOVE_TABLE_ROW: {
            const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === action.payload.elementId && e.type === 'TABLE' && e.rows > 1) {
                    return { ...e, rows: e.rows - 1, cellData: e.cellData.slice(0, -1) };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.ADD_TABLE_COLUMN: {
            const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === action.payload.elementId && e.type === 'TABLE') {
                    const newCellData = e.cellData.map(row => [...row, { id: generateId('cell'), content: '', style: {} }]);
                    return { ...e, columns: e.columns + 1, cellData: newCellData };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.REMOVE_TABLE_COLUMN: {
             const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === action.payload.elementId && e.type === 'TABLE' && e.columns > 1) {
                    const newCellData = e.cellData.map(row => row.slice(0, -1));
                    return { ...e, columns: e.columns - 1, cellData: newCellData };
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        case ActionTypes.UPDATE_CHART_DATA: {
            const { elementId, newChartData } = action.payload;
             const newSlides = updateCurrentSlideElements(state, elements => elements.map(e => {
                if (e.id === elementId && e.type === 'CHART') {
                    const updatedElement = { ...e, ...newChartData };
                    if (newChartData.data) {
                        updatedElement.data = { ...e.data, ...newChartData.data };
                    }
                    return updatedElement;
                }
                return e;
            }));
            return { ...state, slides: newSlides };
        }
        default:
            return state;
    }
}
