
export class CameraControls {

    constructor (camera, renderer, canvas, options = {}) {
    
        // Set default options
        this.dragSensitivity = options.dragSensitivity || 1.0;
        this.zoomSensitivity = options.zoomSensitivity || 1.0;

        // Store references to the camera, renderer and canvas
        this.camera = camera;
        this.renderer = renderer;
        this.canvas = canvas;

        // Implement pan and zoom controls
        let isDragging = false;
        let lastX, lastY;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = (e.clientX - lastX) / canvas.clientWidth * 2 * this.dragSensitivity;
                const dy = (e.clientY - lastY) / canvas.clientHeight * 2 * this.dragSensitivity;
                camera.pan(dx, dy);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                camera.zoomIn(1.1 * this.zoomSensitivity);
            } else {
                camera.zoomOut(1.1 * this.zoomSensitivity);
            }
        });

        // Ensure the canvas size matches its display size
        function resizeCanvasToDisplaySize(canvas) {
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

        // Resize the canvas on window resize
        window.addEventListener('resize', () => {
            resizeCanvasToDisplaySize(canvas);
        });

        // Initial resize
        resizeCanvasToDisplaySize(canvas);

        // Update camera aspect ratio
        function updateCameraAspect() {
            const aspect = canvas.clientWidth / canvas.clientHeight;
            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', updateCameraAspect);
    }

    update () {
        
    }
}