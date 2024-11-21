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
        // Create and bind position buffer
        this.buffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, this.geometry.vertices, gl.STATIC_DRAW);

        // Create and bind UV buffer if UVs are provided
        if (this.geometry.uvs.length > 0) {
            this.buffers.uv = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
            gl.bufferData(gl.ARRAY_BUFFER, this.geometry.uvs, gl.STATIC_DRAW);
        }

        // Create and bind normal buffer if normals are provided
        if (this.geometry.normals.length > 0) {
            this.buffers.normal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
            gl.bufferData(gl.ARRAY_BUFFER, this.geometry.normals, gl.STATIC_DRAW);
        }

        // Create and bind index buffer
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

        // Save current depth test, depth write, and blend state
        const depthTestEnabled = gl.isEnabled(gl.DEPTH_TEST);
        const depthMaskEnabled = gl.getParameter(gl.DEPTH_WRITEMASK);
        const blendEnabled = gl.isEnabled(gl.BLEND);

        // Set depth test
        if (this.material.depthTest) {
            if (!depthTestEnabled) gl.enable(gl.DEPTH_TEST);
        } else {
            if (depthTestEnabled) gl.disable(gl.DEPTH_TEST);
        }

        // Set depth write
        gl.depthMask(this.material.depthWrite);

        // Set blending
        if (this.material.transparent) {
            if (!blendEnabled) gl.enable(gl.BLEND);
        } else {
            if (blendEnabled) gl.disable(gl.BLEND);
        }

        // Call onBeforeDraw if it exists
        if (typeof this.onBeforeDraw === 'function') {
            this.onBeforeDraw(gl);
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
            } else if (uniformName === 'u_map' || uniformName === 'map') {
                if (this.material.map) {
                    // Bind the texture
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this.material.map.texture);
                    gl.uniform1i(uniformLocation, 0); // Texture unit 0
                }
            } else {
                console.warn(`Uniform '${uniformName}' is not recognized.`);
            }
        }

        // Bind index buffer and draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    
        // Restore previous depth test, depth write, and blend state
        if (depthTestEnabled) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        gl.depthMask(depthMaskEnabled);

        if (blendEnabled) {
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }
    }

    translate(x, y, z) {
        mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
    }

    rotateX(angle) {
        mat4.rotateX(this.modelMatrix, this.modelMatrix, angle);
    }

    rotateY(angle) {
        mat4.rotateY(this.modelMatrix, this.modelMatrix, angle);
    }

    rotateZ(angle) {
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, angle);
    }
}
