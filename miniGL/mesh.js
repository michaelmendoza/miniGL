import { mat4 } from 'gl-matrix'

// Mesh class
export class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.modelMatrix = mat4.create();
        this.buffers = {};
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

        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.enableVertexAttribArray(this.material.attribLocations.position);
        gl.vertexAttribPointer(this.material.attribLocations.position, 3, gl.FLOAT, false, 0, 0);

        // Set up uniforms
        gl.uniformMatrix4fv(this.material.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
        gl.uniformMatrix4fv(this.material.uniformLocations.viewMatrix, false, camera.viewMatrix);
        gl.uniformMatrix4fv(this.material.uniformLocations.modelMatrix, false, this.modelMatrix);

        if (this.material.uniformLocations.color) {
            gl.uniform4fv(this.material.uniformLocations.color, this.material.color);
        }

        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}