// mesh.js
import { mat4 } from 'gl-matrix';

// Mesh class
export class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.modelMatrix = mat4.create();
        this.buffers = {};
        this.onBeforeDraw = null; // Function to call before drawing
    }

    initBuffers(gl) {
        // Create and bind buffers
        this.buffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, this.geometry.vertices, gl.STATIC_DRAW);

        if (this.geometry.uvs.length > 0) {
            this.buffers.uv = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
            gl.bufferData(gl.ARRAY_BUFFER, this.geometry.uvs, gl.STATIC_DRAW);
        }

        if (this.geometry.normals.length > 0) {
            this.buffers.normal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
            gl.bufferData(gl.ARRAY_BUFFER, this.geometry.normals, gl.STATIC_DRAW);
        }

        this.buffers.index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indices, gl.STATIC_DRAW);
    }

    draw(gl, camera) {
        if (!this.material.program) {
            this.material.compile(gl);
            this.initBuffers(gl);
        }

        gl.useProgram(this.material.program);

        // Call onBeforeDraw if it exists
        if (typeof this.onBeforeDraw === 'function') {
            this.onBeforeDraw();
        }

        // Set up attributes
        for (let attribName in this.material.attribLocations) {
            const attribLocation = this.material.attribLocations[attribName];
            let buffer = null;
            let size = 3; // default to 3 components

            if (attribName === 'a_position' || attribName === 'position') {
                buffer = this.buffers.position;
                size = 3;
            } else if (attribName === 'a_uv' || attribName === 'uv') {
                buffer = this.buffers.uv;
                size = 2;
            } else if (attribName === 'a_normal' || attribName === 'normal') {
                buffer = this.buffers.normal;
                size = 3;
            } else {
                // Handle other attributes if necessary
                console.warn(`Attribute '${attribName}' is not recognized.`);
                continue;
            }

            if (buffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, false, 0, 0);
            }
        }

        // Set up uniforms
        for (let uniformName in this.material.uniformLocations) {
            const uniformLocation = this.material.uniformLocations[uniformName];
            if (uniformName === 'u_projectionMatrix' || uniformName === 'projectionMatrix') {
                gl.uniformMatrix4fv(uniformLocation, false, camera.projectionMatrix);
            } else if (uniformName === 'u_viewMatrix' || uniformName === 'viewMatrix') {
                gl.uniformMatrix4fv(uniformLocation, false, camera.viewMatrix);
            } else if (uniformName === 'u_modelMatrix' || uniformName === 'modelMatrix') {
                gl.uniformMatrix4fv(uniformLocation, false, this.modelMatrix);
            } else if (uniformName === 'u_color' || uniformName === 'color') {
                if (this.material.color) {
                    gl.uniform4fv(uniformLocation, this.material.color);
                }
            } else {
                // Handle other uniforms if necessary
                console.warn(`Uniform '${uniformName}' is not recognized.`);
            }
        }

        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
