import { compileShader, createProgram } from './webgl.js';

// Base class for materials
export class Material {
    constructor() {
        this.program = null;
        this.uniforms = {};
        this.attribLocations = {};
        this.uniformLocations = {};
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
        this.map = params.map || null; 
        this.transparent = params.transparent || false;
        this.depthTest = params.depthTest !== undefined ? params.depthTest : true;
        this.depthWrite = params.depthWrite !== undefined ? params.depthWrite : !this.transparent;

        const useMap = this.map !== null;

        this.vertexShaderSrc = `
            attribute vec3 a_position;
            ${useMap ? 'attribute vec2 a_uv;' : ''}
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_modelMatrix;
            ${useMap ? 'varying vec2 v_uv;' : ''}

            void main() {
                ${useMap ? 'v_uv = a_uv;' : ''}
                gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
            }
        `;
        this.fragmentShaderSrc = `
            precision mediump float;
            uniform vec4 u_color;
            ${useMap ? 'uniform sampler2D u_map;' : ''}
            ${useMap ? 'varying vec2 v_uv;' : ''}

            void main() {
                vec4 baseColor = u_color;
                ${useMap ? 'vec4 textureColor = texture2D(u_map, v_uv);' : ''}
                ${useMap ? 'baseColor *= textureColor;' : ''}
                gl_FragColor = baseColor;
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
        if (this.map) {
            this.attribLocations.uv = gl.getAttribLocation(this.program, 'a_uv');
        }
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
            modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
            color: gl.getUniformLocation(this.program, 'u_color'),
        };
        if (this.map) {
            this.uniformLocations.map = gl.getUniformLocation(this.program, 'u_map');
        }
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
