
export class CameraControls {

    constructor (camera, renderer, canvas, options = {}) {
    
        // Set default options
        this.useDrag = options.useDrag !== undefined ? options.useDrag : true;
        this.useZoom = options.useZoom !== undefined ? options.useZoom : true;
        this.useResize = options.useResize !== undefined ? options.useResize : true;
        this.dragSensitivity = options.dragSensitivity || 1.0;
        this.zoomSensitivity = options.zoomSensitivity || 1.0;

        // Store references to the camera, renderer and canvas
        this.camera = camera;
        this.renderer = renderer;
        this.canvas = canvas;

        if (this.useDrag) this.drag();
        if (this.useZoom) this.zoom();
        if (this.resize) this.resize();
    }

    update () {
        
    }

    drag () {
        let isDragging = false;
        let lastX, lastY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = (e.clientX - lastX) / this.canvas.clientWidth * 2 * this.dragSensitivity;
                const dy = (e.clientY - lastY) / this.canvas.clientHeight * 2 * this.dragSensitivity;
                this.camera.pan(dx, dy);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });

    }

    zoom () {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.camera.zoomIn(1.1 * this.zoomSensitivity);
            } else {
                this.camera.zoomOut(1.1 * this.zoomSensitivity);
            }
        });  
    }

    resize() {
        const canvas = this.canvas;
        const camera = this.camera;
        
        // Update camera aspect ratio
        function updateCameraAspect() {
            const aspect = canvas.clientWidth / canvas.clientHeight;
            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();
        }

        // Ensure the canvas size matches its display size
        function resizeCanvasToDisplaySize() {
            const displayWidth  = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            if (canvas.width !== displayWidth ||
                canvas.height !== displayHeight) {

                canvas.width  = displayWidth;
                canvas.height = displayHeight;
                renderer.setSize(displayWidth, displayHeight);
                if (camera) {
                    updateCameraAspect();
                }
            }
        }

        window.addEventListener('resize', updateCameraAspect);
        window.addEventListener('resize', resizeCanvasToDisplaySize);
        resizeCanvasToDisplaySize(canvas);
    }
}