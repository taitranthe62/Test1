
import { v4 as uuidv4 } from 'uuid';
import { Slide, SlideElement, ThemePack, BackgroundDefinition } from './types';

const generateId = (prefix: string) => `${prefix}-${uuidv4()}`;

/**
 * A PresentationBuilder provides a "SQL-like" fluent API for constructing a presentation.
 * This class acts as the "mini environment" requested, holding the state of the
 * presentation as it's being built and providing chainable methods that act as commands.
 *
 * Example Usage:
 * const builder = new PresentationBuilder(myTheme);
 * builder
 *   .createSlide()  // "CREATE SLIDE"
 *   .setBackground(myBackground) // "SET BACKGROUND"
 *   .addElement(myTitleElement) // "ADD ELEMENT"
 *   .addElement(myBodyElement);
 *
 * const finalSlides = builder.getResult(); // "GET RESULT"
 */
export class PresentationBuilder {
    private slides: Slide[] = [];
    private currentSlideIndex: number = -1;
    private readonly theme: ThemePack;

    constructor(theme: ThemePack) {
        this.theme = theme;
    }

    /**
     * COMMAND: CREATE SLIDE
     * Adds a new, empty slide to the presentation and sets it as the current target
     * for subsequent commands like `setBackground` or `addElement`.
     * @returns The builder instance for chaining.
     */
    public createSlide(): this {
        // Fix: Added required 'layout' property to match the Slide type definition.
        const newSlide: Slide = {
            id: generateId('slide'),
            layout: 'content',
            elements: [],
            // A default background that will be immediately overwritten by setBackground
            background: { color: '#ffffff', primaryTextColor: '#000000', secondaryTextColor: '#333333' },
        };
        this.slides.push(newSlide);
        this.currentSlideIndex = this.slides.length - 1;
        return this;
    }

    /**
     * COMMAND: SET BACKGROUND
     * Sets the background for the current slide. Throws an error if no slide has been created yet.
     * @param background The BackgroundDefinition to apply.
     * @returns The builder instance for chaining.
     */
    public setBackground(background: BackgroundDefinition): this {
        if (this.currentSlideIndex === -1) {
            throw new Error("Cannot set background before creating a slide. Call createSlide() first.");
        }
        this.slides[this.currentSlideIndex].background = background;
        return this;
    }

    /**
     * COMMAND: ADD ELEMENT
     * Adds a fully-formed SlideElement to the current slide. Throws an error if no slide exists.
     * @param element The SlideElement to add.
     * @returns The builder instance for chaining.
     */
    public addElement(element: SlideElement): this {
        if (this.currentSlideIndex === -1) {
            throw new Error("Cannot add an element before creating a slide. Call createSlide() first.");
        }
        this.slides[this.currentSlideIndex].elements.push(element);
        return this;
    }
    
    /**
     * COMMAND: GET RESULT
     * Finalizes the build process and returns the completed array of slides.
     * @returns The array of Slide objects.
     */
    public getResult(): Slide[] {
        return this.slides;
    }
}
