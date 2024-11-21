import { Mesh } from './mesh.js'

// Scene class to hold objects
export class Scene {
    constructor() {
        this.children = [];
    }

    add(object) {
        this.children.push(object);
    }

    traverse(callback) {
        this.children.forEach(callback);
    }
}

export class WebGLRenderer {
    constructor(params = {}) {
        this.canvas = params.canvas || document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            alert("WebGL not supported, please use a different browser.");
        }
        this.camera = null;
        this.initialize();
    }

    initialize() {
        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);

        // Set clear color
        this.gl.clearColor(0, 0, 0, 1);

        // Enable blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    onResize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        if (this.camera) {
            this.camera.updateProjectionMatrix();
        }
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        if (this.camera) {
            this.camera.updateProjectionMatrix();
        }
    }

    render(scene, camera) {
        this.camera = camera;
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        scene.traverse((object) => {
            if (object instanceof Mesh) {
                object.draw(this.gl, camera);
            }
        });
    }
}
