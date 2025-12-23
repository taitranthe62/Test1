
import { PRIMARY_LAYOUTS } from './primary';
import { SECONDARY_LAYOUTS } from './secondary';
import { TERTIARY_LAYOUTS } from './tertiary';
import { EXTRA_LAYOUTS } from './extra';
import { STUDY_LAYOUTS } from './study';

export const SLIDE_LAYOUTS = [
    ...PRIMARY_LAYOUTS,
    ...SECONDARY_LAYOUTS,
    ...TERTIARY_LAYOUTS,
    ...EXTRA_LAYOUTS
];

export const STUDY_DECK_LAYOUTS = [
    ...STUDY_LAYOUTS
];

export * from './helpers';
