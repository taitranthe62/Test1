/**
 * Pre-processes an image file for OCR by running it through a multi-stage enhancement pipeline.
 * This significantly improves the accuracy and performance of the OCR engine.
 *
 * @param imageFile The image file (e.g., from an input element) to process.
 * @returns A Promise that resolves with an HTMLCanvasElement containing the processed, high-contrast image.
 */
export const preprocessImageForOCR = (imageFile: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader failed to load the image."));
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) {
                    return reject(new Error('Could not get 2D canvas context.'));
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // --- Stage 1: Grayscale and Contrast Enhancement ---
                let totalLuminance = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = data[i + 1] = data[i + 2] = gray;
                    totalLuminance += gray;
                }
                
                const avgLuminance = totalLuminance / (canvas.width * canvas.height);
                const threshold = avgLuminance * 0.95; // Dynamic threshold based on average brightness

                for (let i = 0; i < data.length; i += 4) {
                    const value = data[i] > threshold ? 255 : 0;
                    data[i] = data[i + 1] = data[i + 2] = value;
                }
                ctx.putImageData(imageData, 0, 0);


                // --- Stage 2: Noise Reduction (Despeckle) ---
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const despeckledData = new Uint8ClampedArray(imageData.data);
                const radius = 1; // 3x3 kernel
                for (let y = radius; y < canvas.height - radius; y++) {
                    for (let x = radius; x < canvas.width - radius; x++) {
                        const i = (y * canvas.width + x) * 4;
                        if (data[i] === 0) { // If pixel is black, check neighbors
                            let whiteNeighbors = 0;
                            for (let ky = -radius; ky <= radius; ky++) {
                                for (let kx = -radius; kx <= radius; kx++) {
                                    if (kx === 0 && ky === 0) continue;
                                    const ni = ((y + ky) * canvas.width + (x + kx)) * 4;
                                    if (data[ni] === 255) whiteNeighbors++;
                                }
                            }
                             // If a black pixel is surrounded by mostly white pixels, it's likely noise
                            if (whiteNeighbors >= 6) {
                                despeckledData[i] = despeckledData[i+1] = despeckledData[i+2] = 255;
                            }
                        }
                    }
                }
                imageData.data.set(despeckledData);
                ctx.putImageData(imageData, 0, 0);


                // --- Stage 3: Sharpening (using a convolution kernel) ---
                const weights = [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ];
                const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const dstData = new Uint8ClampedArray(src.data.length);
                const side = Math.round(Math.sqrt(weights.length));
                const halfSide = Math.floor(side / 2);
                
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        let r = 0, g = 0, b = 0;
                        const dstOff = (y * canvas.width + x) * 4;

                        for (let cy = 0; cy < side; cy++) {
                            for (let cx = 0; cx < side; cx++) {
                                const scy = Math.min(canvas.height - 1, Math.max(0, y + cy - halfSide));
                                const scx = Math.min(canvas.width - 1, Math.max(0, x + cx - halfSide));
                                const srcOff = (scy * canvas.width + scx) * 4;
                                const wt = weights[cy * side + cx];
                                r += src.data[srcOff] * wt;
                                g += src.data[srcOff + 1] * wt;
                                b += src.data[srcOff + 2] * wt;
                            }
                        }
                        dstData[dstOff] = r;
                        dstData[dstOff + 1] = g;
                        dstData[dstOff + 2] = b;
                        dstData[dstOff + 3] = src.data[dstOff + 3]; // Alpha
                    }
                }
                
                const sharpenedImageData = new ImageData(dstData, canvas.width, canvas.height);
                ctx.putImageData(sharpenedImageData, 0, 0);

                resolve(canvas);
            };
            
            img.onerror = (err) => {
                 reject(new Error(`Image failed to load: ${err}`));
            };
            
            img.src = event.target.result as string;
        };
        
        reader.onerror = () => {
             reject(new Error("FileReader encountered an error."));
        };
        
        reader.readAsDataURL(imageFile);
    });
};
