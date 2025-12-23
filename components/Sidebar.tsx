
import React, { useState, useRef, useContext, useMemo } from 'react';
import { PresentationContext } from '../presentationContext';
import { ActionTypes } from '../actions';
import { SLIDE_LAYOUTS } from '../templates';
import { SlideTemplate, Slide, ShapeElement, ImageElement, LayoutPriority } from '../types';
import SlideBackground from './SlideBackground';
import { TrashIcon } from './icons/TrashIcon';
import { ImageIcon } from './icons/ImageIcon';
import { LayoutIcon } from './icons/LayoutIcon';
import { ShapeIcon } from './icons/ShapeIcon';
import { ListIcon } from './icons/ListIcon';
import ImageGallery from './ImageGallery';
import IconPicker from './IconPicker';

interface SidebarProps {
    activeTab: 'outline' | 'layouts' | 'images' | 'graphics';
    setActiveTab: (tab: 'outline' | 'layouts' | 'images' | 'graphics') => void;
    onApplyLayout: (template: SlideTemplate) => void;
}

const SlidePreview: React.FC<{ slide: Slide; index: number; isSelected: boolean; setDragOverIndex: (i: number | null) => void; isDragOver: boolean }> = ({ slide, index, isSelected, setDragOverIndex, isDragOver }) => {
    const scale = 0.12;
    const { dispatch } = useContext(PresentationContext);
    const ref = useRef<HTMLDivElement>(null);

    const handleSelect = () => dispatch({ type: ActionTypes.SELECT_SLIDE, payload: { slideId: slide.id } });
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', index.toString());
        ref.current?.classList.add('opacity-50');
    };

    const handleDragEnd = () => {
        ref.current?.classList.remove('opacity-50');
        setDragOverIndex(null);
    };

    return (
        <div
            ref={ref}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={() => setDragOverIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                dispatch({ type: ActionTypes.MOVE_SLIDE, payload: { dragIndex, hoverIndex: index } });
                setDragOverIndex(null);
            }}
            onClick={handleSelect}
            className={`w-full aspect-[16/9] border-2 rounded-xl cursor-pointer relative overflow-hidden transition-all duration-300 bg-white group
                ${isSelected ? 'border-blue-500 ring-4 ring-blue-500/15 shadow-xl scale-[1.02]' : 'border-gray-100 hover:border-blue-200 hover:shadow-lg'}
                ${isDragOver ? 'border-t-4 border-t-blue-500' : ''}
            `}
        >
            <div 
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: '1280px', height: '720px', transform: `scale(${scale})`, pointerEvents: 'none' }}
            >
                <SlideBackground background={slide.background} />
                {slide.elements.map(element => (
                    <div key={element.id} style={element.style}>
                        {element.type === 'TEXT' && <div dangerouslySetInnerHTML={{ __html: element.content }}></div>}
                        {element.type === 'IMAGE' && <img src={(element as ImageElement).src} alt="" className="w-full h-full object-cover" />}
                    </div>
                ))}
            </div>
            <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                TRANG {index + 1}
            </div>
        </div>
    );
};

const TemplatePreview: React.FC<{ template: SlideTemplate; onSelect: () => void }> = ({ template, onSelect }) => {
    const scale = 0.12;
    return (
        <div className="group cursor-pointer" onClick={onSelect}>
            <div className="w-full aspect-[16/9] border border-gray-100 rounded-xl overflow-hidden bg-white group-hover:border-blue-500 group-hover:shadow-2xl transition-all relative">
                <div className="absolute top-0 left-0 origin-top-left" style={{ width: '1280px', height: '720px', transform: `scale(${scale})`, pointerEvents: 'none' }}>
                    <SlideBackground background={{ color: '#ffffff', primaryTextColor: '#000', secondaryTextColor: '#333' }} />
                    {template.previewElements.map((el, i) => (
                        <div key={i} style={{ ...el.style, backgroundColor: el.type === 'SHAPE' ? '#f1f5f9' : (el.type === 'TEXT' ? '#f8fafc' : 'transparent'), border: el.type === 'TEXT' ? '1px dashed #e2e8f0' : 'none', borderRadius: '4px' }}>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">Chọn Khung</span>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center truncate group-hover:text-blue-600 font-black uppercase tracking-widest">{template.name}</p>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onApplyLayout }) => {
    const { state, dispatch } = useContext(PresentationContext);
    const { slides, currentSlideId } = state;
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const tabs = [
        { id: 'outline', icon: <ListIcon />, label: 'DÀN Ý' },
        { id: 'layouts', icon: <LayoutIcon />, label: 'KHUNG HÌNH' },
        { id: 'images', icon: <ImageIcon />, label: 'HÌNH ẢNH' },
        { id: 'graphics', icon: <ShapeIcon />, label: 'ĐỒ HỌA' },
    ];

    return (
        <div className="flex w-96 bg-white border-r border-slate-100 shadow-2xl z-20">
            {/* Nav Rail */}
            <div className="w-20 flex flex-col items-center py-8 bg-slate-900 gap-10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className={`p-2.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-110' : 'bg-slate-800'}`}>
                            {React.cloneElement(tab.icon as React.ReactElement, { className: 'w-6 h-6' })}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Panel Content */}
            <div className="flex-grow flex flex-col h-full overflow-hidden bg-slate-50/50">
                <div className="px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                    <h3 className="font-black text-xs text-slate-900 uppercase tracking-[0.2em]">
                        {activeTab === 'outline' ? 'Quản lý Slide' : activeTab === 'layouts' ? 'Thư viện Khung' : activeTab === 'images' ? 'Kho Hình Ảnh' : 'Đồ Họa & Biểu tượng'}
                    </h3>
                    {activeTab === 'outline' && (
                        <button 
                            onClick={() => dispatch({ type: ActionTypes.ADD_SLIDE })}
                            className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                            title="Thêm Slide mới"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'outline' && (
                        <div className="space-y-8">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="relative group/slide-item">
                                    <SlidePreview
                                        slide={slide}
                                        index={index}
                                        isSelected={slide.id === currentSlideId}
                                        setDragOverIndex={setDragOverIndex}
                                        isDragOver={dragOverIndex === index}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); dispatch({ type: ActionTypes.DELETE_SLIDE, payload: { slideId: slide.id } }); }}
                                        className="absolute -top-2 -right-2 p-2 bg-white rounded-full text-slate-300 hover:text-red-600 opacity-0 group-hover/slide-item:opacity-100 transition-all shadow-xl hover:scale-110 z-10 border border-slate-100"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'layouts' && (
                        <div className="grid grid-cols-2 gap-6">
                            {SLIDE_LAYOUTS.map(template => (
                                <TemplatePreview 
                                    key={template.type} 
                                    template={template} 
                                    onSelect={() => onApplyLayout(template)} 
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <ImageGallery 
                            onSelectImage={(src) => dispatch({ type: ActionTypes.ADD_ELEMENT, payload: { type: 'IMAGE', options: { src } } })} 
                            onClose={() => setActiveTab('outline')}
                            inline={true}
                        />
                    )}

                    {activeTab === 'graphics' && (
                        <IconPicker 
                            onSelectIcon={(iconName) => dispatch({ type: ActionTypes.ADD_ELEMENT, payload: { type: 'ICON', options: { iconName } } })} 
                            onClose={() => setActiveTab('outline')}
                            inline={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
