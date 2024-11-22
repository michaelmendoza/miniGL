// miniGL/raycaster.js

import { vec3, mat4, vec2 } from 'gl-matrix';
import { PlaneGeometry } from './geometry.js';

/** Basic raycaster class: Implements raycasting for objects (PlaneGeometry only for now) */
export class Raycaster {
    constructor() {
        this.origin = vec3.create();
        this.direction = vec3.create();
    }

    setFromCamera(coords, camera) {
        const x = coords.x;
        const y = coords.y;

        // Convert NDC to world coordinates
        const nearPoint = vec3.fromValues(x, y, -1); // Near plane in NDC
        const farPoint = vec3.fromValues(x, y, 1);   // Far plane in NDC

        // Inverse of projection * view matrix
        const invProjectionView = mat4.create();
        mat4.multiply(invProjectionView, camera.projectionMatrix, camera.viewMatrix);
        mat4.invert(invProjectionView, invProjectionView);

        // Unproject near and far points
        const nearWorld = vec3.create();
        vec3.transformMat4(nearWorld, nearPoint, invProjectionView);

        const farWorld = vec3.create();
        vec3.transformMat4(farWorld, farPoint, invProjectionView);

        // Set ray origin and direction
        vec3.copy(this.origin, nearWorld);
        vec3.subtract(this.direction, farWorld, nearWorld);
        vec3.normalize(this.direction, this.direction);
    }

    intersectObject(objects) {
        const intersects = [];

        if (!Array.isArray(objects)) {
            objects = [objects];
        }

        objects.forEach(object => {
            if (object.geometry instanceof PlaneGeometry) {
                const intersection = this.intersectPlane(object);
                if (intersection) {
                    intersects.push(intersection);
                }
            }
            // Additional geometry types can be added here
        });

        intersects.sort((a, b) => a.distance - b.distance);

        return intersects;
    }

    intersectPlane(object) {
        const modelMatrix = object.modelMatrix;

        // Plane normal in local space
        const planeNormal = vec3.fromValues(0, 0, 1);

        // Transform plane normal to world space
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        vec3.transformMat4(planeNormal, planeNormal, normalMatrix);
        vec3.normalize(planeNormal, planeNormal);

        // Get a point on the plane in world space
        const planePoint = vec3.create();
        vec3.transformMat4(planePoint, planePoint, modelMatrix);

        // Compute ray-plane intersection
        const denom = vec3.dot(planeNormal, this.direction);

        if (Math.abs(denom) > 1e-6) {
            const diff = vec3.create();
            vec3.subtract(diff, planePoint, this.origin);
            const t = vec3.dot(diff, planeNormal) / denom;

            if (t >= 0) {
                // Intersection point in world space
                const point = vec3.create();
                vec3.scaleAndAdd(point, this.origin, this.direction, t);

                // Transform point to object local space
                const inverseModelMatrix = mat4.create();
                mat4.invert(inverseModelMatrix, modelMatrix);
                const localPoint = vec3.create();
                vec3.transformMat4(localPoint, point, inverseModelMatrix);

                // Retrieve the correct width and height from the geometry
                const width = object.geometry.width;
                const height = object.geometry.height;

                // Check if the local point is within the plane bounds
                const halfWidth = width / 2;
                const halfHeight = height / 2;

                if (
                    localPoint[0] >= -halfWidth && localPoint[0] <= halfWidth &&
                    localPoint[1] >= -halfHeight && localPoint[1] <= halfHeight
                ) {
                    // Compute UV coordinates
                    const u = (localPoint[0] + halfWidth) / width;
                    const v = (localPoint[1] + halfHeight) / height;
                    const uv = vec2.fromValues(u, v);

                    // Normal at intersection
                    const normal = vec3.clone(planeNormal);

                    const distance = t;

                    return {
                        distance: distance,
                        point: point,
                        object: object,
                        uv: uv,
                        normal: normal
                    };
                }
            }
        }

        return null; // No valid intersection within the plane bounds
    }

}

/** DataTextureRaycaster class: Implements raycasting for DataTextures */
export class DataTextureRaycaster {
    constructor(texture, canvas, camera, objects) {
        this.texture = texture;
        this.canvas = canvas;
        this.camera = camera;
        this.objects = objects;
        this.raycaster = new Raycaster();    
    }

    intersectData = (event, callback) => {
        // Get mouse NDC coordinates
        const ndcCoords = this.getMouseNDC(event);

        // Set ray from camera
        this.raycaster.setFromCamera(ndcCoords, this.camera);

        // Intersect objects in the scene
        const intersects = this.raycaster.intersectObject(this.objects);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const uv = intersect.uv;

            // Compute data texture value at the UV coordinates
            const u = uv[0];
            const v = uv[1];

            // Data texture coordinates
            const x = Math.floor(u * (this.texture.width - 1) + 0.5);
            const y = Math.floor((1 - v) * (this.texture.height - 1) + 0.5); // Flip Y axis

            const index = y * this.texture.width + x;
            const value = this.texture.data[index];

            callback({ x, y, value });
        } else {
            callback(null);
        }
    };

     // Function to convert mouse event to NDC coordinates
    getMouseNDC = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        const y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
        return { x: x, y: y };
    }
}