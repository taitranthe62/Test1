import React from 'react';
import { PlusIcon } from './PlusIcon';
import { ImageIcon } from './ImageIcon';
import { LayoutIcon } from './LayoutIcon';
import { PlayIcon } from './PlayIcon';
import { TrashIcon } from './TrashIcon';
import { XIcon } from './XIcon';
import { EmojiIcon } from './EmojiIcon';
import { TextIcon } from './TextIcon';
import { SaveIcon } from './SaveIcon';
import { LoadIcon } from './LoadIcon';
import { MagicIcon } from './MagicIcon';
import { DownloadIcon } from './DownloadIcon';
import { ShapeIcon } from './ShapeIcon';
import { IconLibraryIcon } from './IconLibraryIcon';
import { PaintBrushIcon } from './PaintBrushIcon';
import { AlignLeftIcon } from './AlignLeftIcon';
import { AlignCenterIcon } from './AlignCenterIcon';
import { AlignRightIcon } from './AlignRightIcon';
import { BoldIcon } from './BoldIcon';
import { ItalicIcon } from './ItalicIcon';
import { UnderlineIcon } from './UnderlineIcon';
import { BringForwardIcon } from './BringForwardIcon';
import { SendBackwardIcon } from './SendBackwardIcon';
import { UploadIcon } from './UploadIcon';
import { XCircleIcon } from './XCircleIcon';
import { BookOpenIcon } from './BookOpenIcon';
import { PresentationIcon } from './PresentationIcon';
import { ChartIcon } from './ChartIcon';

// New, specific icons for use within slides
import { ArrowRightIcon } from './ArrowRightIcon';
import { CheckCircleIcon } from './CheckCircleIcon';
import { LightbulbIcon } from './LightbulbIcon';
import { StarIcon } from './StarIcon';
import { TargetIcon } from './TargetIcon';
import { TableIcon } from './TableIcon';


export const ICON_LIBRARY: Record<string, React.FC<any>> = {
    // UI Icons (can also be used in slides)
    Plus: PlusIcon,
    Image: ImageIcon,
    Layout: LayoutIcon,
    Play: PlayIcon,
    Trash: TrashIcon,
    X: XIcon,
    Emoji: EmojiIcon,
    Text: TextIcon,
    Save: SaveIcon,
    Load: LoadIcon,
    Magic: MagicIcon,
    Download: DownloadIcon,
    Shape: ShapeIcon,
    IconLibrary: IconLibraryIcon,
    PaintBrush: PaintBrushIcon,
    AlignLeft: AlignLeftIcon,
    AlignCenter: AlignCenterIcon,
    AlignRight: AlignRightIcon,
    Bold: BoldIcon,
    Italic: ItalicIcon,
    Underline: UnderlineIcon,
    BringForward: BringForwardIcon,
    SendBackward: SendBackwardIcon,
    Upload: UploadIcon,
    XCircle: XCircleIcon,
    BookOpen: BookOpenIcon,
    Presentation: PresentationIcon,
    Chart: ChartIcon,
    Table: TableIcon,

    // Content-specific icons
    ArrowRight: ArrowRightIcon,
    CheckCircle: CheckCircleIcon,
    Lightbulb: LightbulbIcon,
    Star: StarIcon,
    Target: TargetIcon,
};

interface IconComponentProps {
    iconName: string;
    className?: string;
}

export const IconComponent: React.FC<IconComponentProps> = ({ iconName, className }) => {
    const Icon = ICON_LIBRARY[iconName];
    if (!Icon) {
        return <div className="w-full h-full bg-red-200 text-red-700 text-xs flex items-center justify-center">?</div>; // Fallback for unknown icon
    }
    return <Icon className={className} />;
};