import { compileShader, createProgram } from './webgl.js';

// Base class for materials
export class Material {
    constructor() {
        this.program = null;
        this.uniforms = {};
    }

    compile(gl) {
        // To be implemented in subclasses
    }
}

// MeshBasicMaterial class
export class MeshBasicMaterial extends Material {
    constructor(params = {}) {
        super();
        this.color = params.color || [1, 1, 1, 1];
        this.vertexShaderSrc = `
            attribute vec3 a_position;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_modelMatrix;
            void main() {
                gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
            }
        `;
        this.fragmentShaderSrc = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;
    }

    compile(gl) {
        // Compile shaders and create program
        const vertexShader = compileShader(gl, this.vertexShaderSrc, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, this.fragmentShaderSrc, gl.FRAGMENT_SHADER);
        this.program = createProgram(gl, vertexShader, fragmentShader);
        // Get attribute and uniform locations
        this.attribLocations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
        };
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
            modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
            color: gl.getUniformLocation(this.program, 'u_color'),
        };
    }
}

// ShaderMaterial class
export class ShaderMaterial extends Material {
    constructor(params = {}) {
        super();
        this.vertexShaderSrc = params.vertexShader || '';
        this.fragmentShaderSrc = params.fragmentShader || '';
        this.uniforms = params.uniforms || {};
        this.attributes = params.attributes || {};
    }

    compile(gl) {
        // Compile shaders and create program
        const vertexShader = compileShader(gl, this.vertexShaderSrc, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, this.fragmentShaderSrc, gl.FRAGMENT_SHADER);
        this.program = createProgram(gl, vertexShader, fragmentShader);

        // Get attribute locations
        this.attribLocations = {};
        for (let attribName in this.attributes) {
            this.attribLocations[attribName] = gl.getAttribLocation(this.program, attribName);
        }

        // Get uniform locations
        this.uniformLocations = {};
        for (let uniformName in this.uniforms) {
            this.uniformLocations[uniformName] = gl.getUniformLocation(this.program, uniformName);
        }
    }
}