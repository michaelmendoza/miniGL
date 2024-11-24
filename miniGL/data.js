import { DataTextureRaycaster } from './raycaster.js'
import { PlaneGeometry } from './geometry.js'
import { DataTexture } from './texture.js';
import { WebGLRenderer, Scene } from './renderer.js';
import { OrthographicCamera } from './camera.js';
import { CameraControls } from './controls.js';
import { MeshBasicMaterial } from './material.js';
import { Mesh } from './mesh.js';

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
    constructor(dataTexture, brushSize = 10) {
        this.dataTexture = dataTexture;
        this.brushSize = brushSize;
        this.mode = 'add'; // or 'remove'
    }

    applyBrushToData = (centerX, centerY) => {
        const radius = (this.brushSize + 1 ) / 2;

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
                        const index = Math.round(imgY) * this.dataTexture.width + Math.round(imgX);

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
export class DataLayerCanvas {
    constructor(renderer, width = 256, height = 256) {
        this.type = 'data';
        this.width = width;
        this.height = height;
        this.geometry = new PlaneGeometry(2, 2);
        this.dataArray = new Uint8Array(width * height);

        this.texture = new DataTexture(renderer.gl, {
            data: this.dataArray,
            width: this.width,
            height: this.height,
        });
        this.material = new MeshBasicMaterial({
            color: [1, 1, 1, 1], // White color to see the texture as is
            map: this.texture
        });
        this.mesh = new Mesh(this.geometry, this.material);
        this.raycaster  = new DataTextureRaycaster(this.texture, renderer.canvas, renderer.camera, [this.mesh]);
    }

    setData(dataArray) {
        this.dataArray = dataArray;
        this.texture.data = dataArray;
    }

    updateData(update) {
        update(this.dataArray, this.width, this.height);
        this.texture.update(this.dataArray);
    }

    raycast = (event, onRaycast = null) => {
        this.raycaster.intersectData(event, (data) => {
            if (data !== null && onRaycast !== null) {
                onRaycast(data);
            }
        })
    }
}

export class MaskLayerCanvas {
    constructor(renderer, width = 256, height = 256) {
        this.type = 'mask';
        this.width = width;
        this.height = height;
        this.geometry = new PlaneGeometry(2, 2);
        this.dataArray = new Uint8Array(width * height);

        this.texture = new DataTexture(renderer.gl, {
            data: this.dataArray,
            width: this.width,
            height: this.height,
        });
        this.material = new MeshBasicMaterial({
            color: [1, 0, 0, 0.5], // Semi-transparent red
            map: this.texture,
            transparent: true,
        });
        this.mesh = new Mesh(this.geometry, this.material);
        this.raycaster  = new DataTextureRaycaster(this.texture, renderer.canvas, renderer.camera, [this.mesh]);
        this.isDrawing = false;
        this.maskBrush = new DataBrush(this.texture);
        this.dataStats = new DataStats();

        this.mesh.translate(0, 0, 0.01);
    }

    setBrushSize = (brushSize) => {
        this.maskBrush.brushSize = brushSize;
    }

    setBrushMode = (mode) => {
        this.maskBrush.mode = mode;
    }

    raycast = (event, onRaycast = null) => {
        this.raycaster.intersectData(event, (data) => {
            if (data !== null && onRaycast) {
                onRaycast(data);
            }

            if (data !== null && this.isDrawing) {
                    this.maskBrush.applyBrushToData(data.x, data.y);
                    this.texture.update(this.texture.data);
            }
        })
    }

}

export class DataCanvas { 

    /** 
     *  Constructor for DataCanvas class
     * 
     *  @param {string} canvasID: ID of the canvas element
     *  @param {[]} layers: Array of LayerCanvas objects
     *  @param {{}} handlers: Object with event handlers for mouse events and raycasting (optional)
     *                   Available: onMouseDown, onMouseUp, onMouseMove, onMouseLeave, onDataLayerRaycast, onMaskLayerRaycast
     */
    constructor(canvasID, handlers = {}) {

        this.canvas = document.getElementById(canvasID);
        this.renderer = new WebGLRenderer({ canvas:this.canvas });
        this.scene = new Scene();
        this.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new OrthographicCamera(-this.aspect, this.aspect, 1, -1, 0.1, 1000);
        this.controls = new CameraControls(this.camera, this.renderer, this.canvas, { useDrag: false });
        this.isMouseDown = false;
        this.handlers = {  
                        onMouseDown: () => {}, onMouseUp: () => {}, 
                        onMouseMove: () => {}, onMouseLeave: () => {}, 
                        onDataLayerRaycast: () => {}, onMaskLayerRaycast: () => {},
                        ...handlers,
        };
        
        this.layers = [];       // Array of layers
        this.dataLayer = null;  // Active data layer
        this.maskLayer = null;  // Active mask layer
        this.maskLayers = [];   // Array of mask layers

        this.renderer.render(this.scene, this.camera);

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    setLayers = (layers) => {
        this.layers = layers;
        layers.forEach((layer) => {
            this.scene.add(layer.mesh);
            if (layer.type == 'data') { this.dataLayer = layer; } // Store reference to data layer (to last data layer in layers)
            if (layer.type == 'mask') { 
                this.maskLayer = layer;         // Store reference to active mask layer
                this.maskLayers.push(layer);    // Store reference to mask layer
            } 
        });
    }

    setBrushSize = (brushSize) => {
        this.maskLayers.forEach((layer) => {
            layer.maskBrush.brushSize = brushSize;
        });
    }

    setBrushMode = (mode) => {
        this.maskLayers.forEach((layer) => {
            layer.maskBrush.mode = mode;
        });
    }

    render = () => {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    handleMouseDown(event) {
        this.isMouseDown = true;
        if (this.maskLayer) {
            this.maskLayer.isDrawing = true;
        }
        this.handlers?.onMouseDown(event);
    }

    handleMouseUp(event) {
        this.isMouseDown = false;
        if (this.maskLayer) {
            this.maskLayer.isDrawing = false;
        }
        this.handlers?.onMouseUp(event);
    }

    handleMouseLeave(event) {
        this.isMouseDown = false;
        this.handlers?.onMouseLeave(event);
    }

    handleMouseMove(event) {
        // Raycast for data layers
        this.layers.forEach((layer) => {
            if (layer.type == 'data') {
                layer.raycast(event, this.handlers?.onDataLayerRaycast);
            }
        });

        // Raycast for mask layers
        if (this.isMouseDown && this.maskLayer && this.maskLayer.isDrawing) { 
            this.maskLayer.raycast(event);
            this.maskLayer.dataStats.update(this.dataLayer.texture.data, this.maskLayer.texture.data);
            this.handlers?.onMaskLayerRaycast(this.maskLayer);
        }

        this.handlers?.onMouseMove(event);
    }
}