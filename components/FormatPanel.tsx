
import React, { useState, useEffect, useContext } from 'react';
import { SlideElement, ShapeElement, IconElement, BackgroundDefinition, TableElement, ChartElement, ChartData, TableCell } from '../types';
import { FONT_FACES } from '../constants';
import { AlignLeftIcon } from './icons/AlignLeftIcon';
import { AlignCenterIcon } from './icons/AlignCenterIcon';
import { AlignRightIcon } from './icons/AlignRightIcon';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EmojiIcon } from './icons/EmojiIcon';
import { BringForwardIcon } from './icons/BringForwardIcon';
import { SendBackwardIcon } from './icons/SendBackwardIcon';
import { XIcon } from './icons/XIcon';
import { ICON_LIBRARY } from './icons/library';
import { PresentationContext } from '../presentationContext';
import { ActionTypes } from '../actions';
import { tableDataToString, stringToTableData, chartDataToString, stringToChartData } from '../csv.utils';

interface FormatPanelProps {
  slideBackground: BackgroundDefinition;
  onShowEmojiPicker: () => void;
  onClose: () => void;
}

const parseGradient = (color: string) => {
    if (!color.startsWith('linear-gradient')) {
        return { color1: color, color2: '#ffffff', angle: 90 };
    }
    const colorRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g;
    const angleRegex = /(\d+)deg/;
    
    const colors = color.match(colorRegex) || ['#ffffff', '#000000'];
    const angleMatch = color.match(angleRegex);
    const angle = angleMatch ? parseInt(angleMatch[1], 10) : 90;

    return { color1: colors[0], color2: colors[1], angle };
};

const FormatPanel: React.FC<FormatPanelProps> = ({ 
    slideBackground, 
    onShowEmojiPicker,
    onClose,
}) => {
  const { state, dispatch } = useContext(PresentationContext);
  const { selectedElement: element } = state;
  
  const isGradient = slideBackground.color.startsWith('linear-gradient');
  const [bgType, setBgType] = useState<'solid' | 'gradient'>(isGradient ? 'gradient' : 'solid');
  const [gradient, setGradient] = useState(parseGradient(slideBackground.color));
  const [chartDataText, setChartDataText] = useState('');
  const [tableDataText, setTableDataText] = useState('');

  const onUpdateSlideBackground = (background: BackgroundDefinition) => dispatch({ type: ActionTypes.UPDATE_SLIDE_BACKGROUND, payload: { background } });

  useEffect(() => {
    if (element?.type === 'CHART') {
        setChartDataText(chartDataToString((element as ChartElement).data));
    }
    if (element?.type === 'TABLE') {
        setTableDataText(tableDataToString((element as TableElement).cellData));
    }
  }, [element]);

  useEffect(() => {
    if (bgType === 'gradient') {
      const newColor = `linear-gradient(${gradient.angle}deg, ${gradient.color1}, ${gradient.color2})`;
      if (slideBackground.color !== newColor) {
        onUpdateSlideBackground({ ...slideBackground, color: newColor });
      }
    }
  }, [gradient, bgType, slideBackground, onUpdateSlideBackground]);

  const handleStyleChange = (property: keyof React.CSSProperties, value: any) => {
    if (element) {
      dispatch({ type: ActionTypes.UPDATE_ELEMENT_STYLE, payload: { elementId: element.id, newStyle: { [property]: value } } });
    }
  };

  const toggleStyle = (property: keyof React.CSSProperties, value1: any, value2: any) => {
    if (!element || element.type !== 'TEXT') return;
    // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
    if ((element.style as any)[property] === value1) {
        handleStyleChange(property, value2);
    } else {
        handleStyleChange(property, value1);
    }
  }

  const handleChartDataBlur = () => {
    if (element?.type === 'CHART') {
        const newData = stringToChartData(chartDataText, (element as ChartElement).data)
        dispatch({ type: ActionTypes.UPDATE_CHART_DATA, payload: { elementId: element.id, newChartData: { data: newData } } });
    }
  }

  const handleTableDataBlur = () => {
    if (element?.type === 'TABLE') {
        const { rows, columns, cellData } = stringToTableData(tableDataText, (element as TableElement).cellData);
        dispatch({ type: ActionTypes.UPDATE_TABLE_DATA, payload: { elementId: element.id, rows, columns, cellData } });
    }
  };


  return (
    <div className="absolute top-4 right-4 w-72 bg-white shadow-lg z-20 p-4 rounded-lg border border-gray-200 max-h-[calc(100vh-2rem)] overflow-y-auto text-sm">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="font-semibold text-gray-700">Formatting</h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                <XIcon size={20} />
            </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Slide Background</label>
                 <div className="flex space-x-1 bg-gray-100 p-1 rounded-md mb-2">
                    <button onClick={() => setBgType('solid')} className={`flex-1 text-xs py-1 rounded ${bgType === 'solid' ? 'bg-white shadow-sm' : ''}`}>Solid</button>
                    <button onClick={() => setBgType('gradient')} className={`flex-1 text-xs py-1 rounded ${bgType === 'gradient' ? 'bg-white shadow-sm' : ''}`}>Gradient</button>
                </div>
                {bgType === 'solid' ? (
                    <input
                        type="color"
                        value={parseGradient(slideBackground.color).color1}
                        onChange={(e) => onUpdateSlideBackground({ ...slideBackground, color: e.target.value })}
                        className="w-full h-8 p-0 border-none cursor-pointer rounded-md"
                    />
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                           <input type="color" value={gradient.color1} onChange={(e) => setGradient(g => ({...g, color1: e.target.value}))} className="w-full h-8 p-0 border-none cursor-pointer rounded-md" />
                           <input type="color" value={gradient.color2} onChange={(e) => setGradient(g => ({...g, color2: e.target.value}))} className="w-full h-8 p-0 border-none cursor-pointer rounded-md" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-500">Angle</label>
                            <input type="range" min="0" max="360" value={gradient.angle} onChange={(e) => setGradient(g => ({...g, angle: parseInt(e.target.value)}))} className="w-full" />
                            <span className="text-xs w-8 text-right">{gradient.angle}°</span>
                        </div>
                    </div>
                )}
            </div>

            {element && <div className="h-px bg-gray-200 my-4"></div>}

            {element && (
                 <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Layer</label>
                    <div className="flex space-x-1">
                        <button onClick={() => dispatch({ type: ActionTypes.MOVE_ELEMENT_LAYER, payload: { elementId: element.id, direction: 'backward' } })} className="flex-1 p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Send Backward"><SendBackwardIcon /></button>
                        <button onClick={() => dispatch({ type: ActionTypes.MOVE_ELEMENT_LAYER, payload: { elementId: element.id, direction: 'forward' } })} className="flex-1 p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Bring Forward"><BringForwardIcon /></button>
                    </div>
                </div>
            )}
            
            {element?.type === 'TEXT' && (
                <>
                    <div>
                        <label htmlFor="font-family" className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                        <select
                            id="font-family"
                            // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                            value={(element.style as any).fontFamily}
                            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {FONT_FACES.map(font => (
                                <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                            <input
                                type="number"
                                // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                value={parseInt((element.style as any).fontSize?.toString() || '13')}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                            <input
                                type="color"
                                // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                value={(element.style as any).color?.toString() || '#000000'}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Style</label>
                        <div className="flex space-x-1">
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} className={`p-2 rounded-md ${(element.style as any).fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><BoldIcon /></button>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} className={`p-2 rounded-md ${(element.style as any).fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><ItalicIcon /></button>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => toggleStyle('textDecoration', 'underline', 'none')} className={`p-2 rounded-md ${(element.style as any).textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><UnderlineIcon /></button>
                            <button onClick={onShowEmojiPicker} className="p-2 rounded-md hover:bg-gray-100"><EmojiIcon /></button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Alignment</label>
                        <div className="flex space-x-1">
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => handleStyleChange('textAlign', 'left')} className={`p-2 rounded-md ${(element.style as any).textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignLeftIcon /></button>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => handleStyleChange('textAlign', 'center')} className={`p-2 rounded-md ${(element.style as any).textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignCenterIcon /></button>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <button onClick={() => handleStyleChange('textAlign', 'right')} className={`p-2 rounded-md ${(element.style as any).textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}><AlignRightIcon /></button>
                        </div>
                    </div>
                </>
            )}
            {element?.type === 'SHAPE' && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Shape Type</label>
                        <select
                            value={(element as ShapeElement).shape}
                            onChange={(e) => dispatch({ type: ActionTypes.UPDATE_ELEMENT, payload: { elementId: element.id, newShape: e.target.value as any } })}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="RECTANGLE">Rectangle</option>
                            <option value="ELLIPSE">Ellipse</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fill Color</label>
                        {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                        <input type="color" value={(element.style as any).backgroundColor?.toString() || '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md" />
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <input type="number" min="0" value={parseInt((element.style as any).borderWidth?.toString() || '0')} onChange={(e) => handleStyleChange('borderWidth', `${e.target.value}px`)} className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <input type="color" value={(element.style as any).borderColor?.toString() || '#000000'} onChange={(e) => handleStyleChange('borderColor', e.target.value)} className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md" />
                        </div>
                     </div>
                     {(element as ShapeElement).shape === 'RECTANGLE' && (
                         <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Corner Radius</label>
                            {/* Fix: Cast element.style to any to access CSS properties that TypeScript cannot find. */}
                            <input type="number" min="0" value={parseInt((element.style as any).borderRadius?.toString() || '0')} onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)} className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm" />
                        </div>
                     )}
                </>
            )}

            {element?.type === 'ICON' && (
                <>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                        <select
                            value={(element as IconElement).iconName}
                            onChange={(e) => dispatch({ type: ActionTypes.UPDATE_ELEMENT, payload: { elementId: element.id, newIconName: e.target.value } })}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm"
                        >
                            {Object.keys(ICON_LIBRARY).map(iconName => (
                                <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                            <input
                                type="number"
                                min="10"
                                // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                value={parseInt((element.style as any).fontSize?.toString() || '100')}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                            <input
                                type="color"
                                // Fix: Cast element.style to any to access CSS properties that TypeScript cannot find.
                                value={(element.style as any).color?.toString() || '#000000'}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md"
                            />
                        </div>
                    </div>
                </>
            )}

            {element?.type === 'TABLE' && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Table Controls</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => dispatch({ type: ActionTypes.ADD_TABLE_ROW, payload: { elementId: element.id } })} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs">Add Row</button>
                            <button onClick={() => dispatch({ type: ActionTypes.REMOVE_TABLE_ROW, payload: { elementId: element.id } })} disabled={(element as TableElement).rows <= 1} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs disabled:opacity-50">Remove Row</button>
                            <button onClick={() => dispatch({ type: ActionTypes.ADD_TABLE_COLUMN, payload: { elementId: element.id } })} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs">Add Column</button>
                            <button onClick={() => dispatch({ type: ActionTypes.REMOVE_TABLE_COLUMN, payload: { elementId: element.id } })} disabled={(element as TableElement).columns <= 1} className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs disabled:opacity-50">Remove Column</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">Table Data (CSV format)</label>
                        <textarea
                            value={tableDataText}
                            onChange={(e) => setTableDataText(e.target.value)}
                            onBlur={handleTableDataBlur}
                            rows={6}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-xs font-mono"
                            placeholder={`Header 1,Header 2\nData A,Data B\nData C,Data D`}
                        />
                         <p className="text-xs text-gray-500 mt-1">Edit data here for bulk changes. Wrap content with commas in quotes (e.g., "Hello, world").</p>
                    </div>
                </>
            )}

            {element?.type === 'CHART' && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Chart Type</label>
                        <select
                            value={(element as ChartElement).chartType}
                            onChange={(e) => dispatch({ type: ActionTypes.UPDATE_CHART_DATA, payload: { elementId: element.id, newChartData: { chartType: e.target.value as any } } })}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="BAR">Bar</option>
                            <option value="PIE">Pie</option>
                            <option value="LINE">Line</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Chart Data</label>
                        <textarea
                            value={chartDataText}
                            onChange={(e) => setChartDataText(e.target.value)}
                            onBlur={handleChartDataBlur}
                            rows={6}
                            className="w-full mt-1 p-1.5 border border-gray-300 rounded-md text-xs font-mono"
                            placeholder={`# Labels\nJan,Feb,Mar\n# Dataset 1\n10,20,15`}
                        />
                    </div>
                    {(element as ChartElement).data.datasets.map((dataset, index) => (
                        <div key={index}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color: {dataset.label}</label>
                            <input
                                type="color"
                                value={(((element as ChartElement).chartType === 'LINE' ? dataset.borderColor : dataset.backgroundColor?.[0]) || '#000000')}
                                onChange={(e) => {
                                    const { data, chartType } = element as ChartElement;
                                    const newDatasets = JSON.parse(JSON.stringify(data.datasets));
                                    const newColor = e.target.value;
                                    const currentDataset = newDatasets[index];

                                    if (chartType === 'PIE') {
                                        currentDataset.backgroundColor = Array(data.labels.length).fill(newColor);
                                    } else if (chartType === 'BAR') {
                                        currentDataset.backgroundColor = [newColor];
                                    } else { // LINE
                                        currentDataset.borderColor = newColor;
                                    }
                                    dispatch({ type: ActionTypes.UPDATE_CHART_DATA, payload: { elementId: element.id, newChartData: { data: { ...data, datasets: newDatasets } } } });
                                }}
                                className="w-full h-9 mt-1 p-0 border-none cursor-pointer rounded-md"
                            />
                        </div>
                    ))}
                </>
            )}
            
            {element && (
                <>
                <div className="h-px bg-gray-200"></div>
                <button
                    onClick={() => dispatch({ type: ActionTypes.DELETE_ELEMENT, payload: { elementId: element.id } })}
                    className="w-full flex items-center justify-center space-x-2 mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Element</span>
                </button>
                </>
            )}

            {!element && (
                <div className="text-center text-xs text-gray-500 py-4">
                    Select an element on the slide to see its formatting options.
                </div>
            )}
        </div>
    </div>
  );
};

export default FormatPanel;