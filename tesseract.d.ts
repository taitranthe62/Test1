// Fix: Wrap declarations in `declare global` and add `export {}` to prevent "Cannot redeclare block-scoped variable" errors.
declare global {
    // More accurate and browser-compatible image-like types
    // Fix: Add `OffscreenCanvas` to the type union to allow its use with Tesseract.js, fixing a type error in the OCR worker.
    type ImageLike =
        | string
        | HTMLImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
        | File
        | Blob
        | ImageData
        | ArrayBuffer
        | Uint8Array
        | OffscreenCanvas;

    // Detailed structure for Bounding Box
    interface Bbox {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    }

    // Detailed structure for recognized words, lines, etc.
    interface RecognizedWord {
        text: string;
        confidence: number;
        bbox: Bbox;
    }

    interface RecognizedLine {
        text: string;
        confidence: number;
        bbox: Bbox;
        words: RecognizedWord[];
    }

    interface RecognizedParagraph {
        text: string;
        confidence: number;
        bbox: Bbox;
        lines: RecognizedLine[];
    }

    // The main result data structure
    interface RecognizeResult {
        data: {
            text: string;
            html: string;
            confidence: number;
            words: RecognizedWord[];
            paragraphs: RecognizedParagraph[];
            lines: RecognizedLine[];
        };
    }

    interface LoggerMessage {
        status: string;
        progress: number;
        jobId?: string;
    }

    interface WorkerOptions {
        logger?: (m: LoggerMessage) => void;
    }

    interface RecognizeOptions {
        rectangle?: {
            top: number;
            left: number;
            width: number;
            height: number;
        };
        [key: string]: any;
    }

    // Modern Worker API
    interface TesseractWorker {
        load(): Promise<void>;
        loadLanguage(langs: string | string[]): Promise<void>;
        initialize(langs: string | string[]): Promise<void>;
        recognize(image: ImageLike, options?: RecognizeOptions): Promise<RecognizeResult>;
        terminate(): Promise<void>;
    }

    const Tesseract: {
        createWorker(options?: WorkerOptions): Promise<TesseractWorker>;
        recognize(
            image: ImageLike,
            lang?: string,
            options?: { logger: (m: LoggerMessage) => void } & RecognizeOptions
        ): Promise<RecognizeResult>;
    };
}

export {};