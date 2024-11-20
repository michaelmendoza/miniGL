import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, ShaderMaterial, CameraControls } from '../miniGL';

export const dataTextureExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    </div>
    `;

    // Get the canvas element
    const canvas = document.getElementById('glCanvas');

    // Initialize renderer
    const renderer = new WebGLRenderer({ canvas });

    // Create scene
    const scene = new Scene();

    // Create camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);

    // Create geometry
    const geometry = new PlaneGeometry(2, 2);

    // Create data array
    const width = 256;
    const height = 256;
    const dataArray = new Uint8Array(width * height);

    // Fill the data array with random values
    for (let i = 0; i < width * height; i++) {
        dataArray[i] = Math.floor(Math.random() * 256); // Random value between 0 and 255
    }

    // Create a texture from the data array
    const gl = renderer.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Since we're using non-power-of-two dimensions, set the texture parameters appropriately
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Horizontal wrap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Vertical wrap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);   // No interpolation when scaling down
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);   // No interpolation when scaling up

    // Upload the data to the texture
    gl.texImage2D(
        gl.TEXTURE_2D,      // Target
        0,                  // Level of detail
        gl.LUMINANCE,       // Internal format
        width,              // Width
        height,             // Height
        0,                  // Border
        gl.LUMINANCE,       // Format
        gl.UNSIGNED_BYTE,   // Type
        dataArray           // Pixel data
    );

    // Create shader material
    const material = new ShaderMaterial({
        vertexShader: `
            attribute vec3 a_position;
            attribute vec2 a_uv;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_modelMatrix;
            varying vec2 v_uv;
            void main() {
                v_uv = a_uv;
                gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
            }
        `,
        fragmentShader: `
            precision mediump float;
            varying vec2 v_uv;
            uniform sampler2D u_dataTexture;
            void main() {
                float value = texture2D(u_dataTexture, v_uv).r; // Get the red (luminance) component
                gl_FragColor = vec4(value, value, value, 1.0); // Use the value as grayscale
            }
        `,
        uniforms: {
            u_projectionMatrix: {},
            u_viewMatrix: {},
            u_modelMatrix: {},
            u_dataTexture: {},
        },
        attributes: {
            a_position: {},
            a_uv: {},
        },
    });

    // Create mesh and add to scene
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    // Modify the Mesh class to handle UVs (if not already handled)
    // In your mesh.js, ensure that the UV buffer is set up and attributes are correctly bound

    // Update the Mesh class to handle custom attributes and uniforms
    // (The previous assistant's response includes the necessary updates)

    // Set up the texture uniform in the Mesh's draw method
    // (The code below shows how to bind the texture and set the uniform)

    // Since we're using custom uniforms, we need to bind the texture before rendering
    mesh.onBeforeDraw = () => {
        // Activate texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Set the uniform to use texture unit 0
        gl.uniform1i(material.uniformLocations.u_dataTexture, 0);
    };

    // Implement onBeforeDraw in the Mesh class
    // (We'll modify the Mesh class to support onBeforeDraw)

    // Camera controls
    const controls = new CameraControls(camera, renderer, canvas);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
};
