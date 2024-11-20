import { mat4 } from 'gl-matrix'

// OrthographicCamera class
export class OrthographicCamera {
    constructor(left, right, top, bottom, near = 0.1, far = 1000, options = {}) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.near = near;
        this.far = far;
        this.zoom = 1;
        this.minZoom = options.minZoom || 0.1;
        this.maxZoom = options.maxZoom || 100;
        this.position = [0, 0, 5];
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();

        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }

    updateProjectionMatrix() {
        mat4.ortho(
            this.projectionMatrix,
            this.left / this.zoom,
            this.right / this.zoom,
            this.bottom / this.zoom,
            this.top / this.zoom,
            this.near,
            this.far
        );
    }

    updateViewMatrix() {
        mat4.identity(this.viewMatrix);
        mat4.translate(this.viewMatrix, this.viewMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
    }

    pan(dx, dy) {
        this.position[0] -= dx / this.zoom * (this.right - this.left) / 2;
        this.position[1] += dy / this.zoom * (this.top - this.bottom) / 2;
        this.updateViewMatrix();
    }

    zoomIn(factor) {
        this.zoom *= factor;
        this.zoom = Math.min(this.zoom, this.maxZoom);
        this.updateProjectionMatrix();
    }

    zoomOut(factor) {
        this.zoom /= factor;
        this.zoom = Math.max(this.zoom, this.minZoom);
        this.updateProjectionMatrix();
    }
}