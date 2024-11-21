import { DataTextureRaycaster } from './raycaster.js'

export class DataStats {

    constructor() {
        this.count = 0;
        this.mean = 0;
        this.min = 0;
        this.max = 0;
        this.stdDev = 0;
    }

    update(data, mask) {
        const maskValues = [];

        if (mask) {
            for (let i = 0; i < data.length; i++) {
                if (mask[i] != 0 ) {
                    maskValues.push(data[i]);
                }
            }
        }
        else {
            maskValues = this.data;
        }

        // Update mean, min, max, and standard deviation
        const mean = maskValues.reduce((a, b) => a + b, 0) / maskValues.length;
        const min = Math.min(...maskValues);
        const max = Math.max(...maskValues);
        const variance = maskValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / maskValues.length;
        this.stdDev = Math.sqrt(variance);

        this.mean = mean;
        this.min = min;
        this.max = max;
        this.count = maskValues.length;
    }
}

export class DataBrush { 
    constructor(dataTexture, brushSize) {
        this.dataTexture = dataTexture;
        this.brushSize = brushSize;
        this.mode = 'add'; // or 'remove'
    }

    applyBrushToData = (centerX, centerY) => {
        const radius = this.brushSize / 2;

        for (let y = -radius; y < radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                const dx = x;
                const dy = y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) { // Circle brush
                    const imgX = centerX + x;
                    const imgY = centerY + y;

                    // Check bounds
                    if (imgX >= 0 && imgX < this.dataTexture.width && imgY >= 0 && imgY < this.dataTexture.height) {
                        const index = imgY * this.dataTexture.width + imgX;

                        if (this.mode === 'add') {
                            this.dataTexture.data[index] = 255;
                        } else if (this.mode === 'remove') {
                            this.dataTexture.data[index] = 0;
                        }
                    }
                }
            }
        }
    }    
}

export class DataSegmentationMask {
    constructor(dataTexture, maskTexture, canvas, scene, camera, brushSize) {
        this.canvas = canvas;
        this.dataTexture = dataTexture;
        this.maskTexture = maskTexture;
        this.dataRaycaster = new DataTextureRaycaster(dataTexture, canvas, scene, camera);
        this.maskRaycaster = new DataTextureRaycaster(maskTexture, canvas, scene, camera);
        this.dataStats = new DataStats();
        this.maskBrush = new DataBrush(maskTexture, brushSize);
        this.isDrawing = false;
    };

    setBrushSize = (brushSize) => {
        this.maskBrush.brushSize = brushSize;
    }

    setBrushMode = (mode) => {
        this.maskBrush.mode = mode;
    }

    /** Creates event listeners for mouse interactions */
    setEventListeners = (onMouseMove, onMouseLeave, onUpdate) => {

        const canvas = this.canvas;
        this.onMouseMove = onMouseMove;
        this.onMouseLeave = onMouseLeave;
        this.onUpdate = onUpdate;

        // Mouse down event listener to start drawing
        this.canvas.addEventListener('mousedown', (event) => {
            this.isDrawing = true;
            this.update(event);
        });

        // Mouse up event listener to stop drawing
        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        canvas.addEventListener('mousemove', (event) => {
            if (this.isDrawing) {
                this.update(event);
            }

            this.dataRaycaster.intersectData(event, (data) => {     
                if (this.onMouseMove) {
                    this.onMouseMove(data);
                }
            });   
        });

        canvas.addEventListener('mouseleave', () => {
            if (this.onMouseLeave) {
                this.onMouseLeave();
            }
        });
    }

    update = (event) => {
        this.maskRaycaster.intersectData(event, (data) => {  
            if (data !== null) {
                this.maskBrush.applyBrushToData(data.x, data.y);                      // Toggle mask values with brush in maskArray
                this.maskTexture.update(this.maskTexture.data);                       // Update the mask texture with the new mask array
                this.dataStats.update(this.dataTexture.data, this.maskTexture.data);  // Recalculate statistics
                if (this.onUpdate) {
                    this.onUpdate(data);
                }
            }
        });
    };
}

class DataLayerCanvas {
    constructor() {
        this.texture = new DataTexture(renderer.gl, {
            data: dataArray,
            width: width,
            height: height,
        });
    }
}

class DataCanvas { 
    constructor(layers, renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        this.camera = renderer.camera;

        this.layers = layers.map((layer) => {
            return new DataLayerCanvas(layer);
        });
    }
}