
import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, ShaderMaterial, CameraControls } from '../miniGL'

export const customShaderExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    </div>
    `

    // Get the canvas element
    const canvas = document.getElementById('glCanvas');

    // Initialize renderer
    const renderer = new WebGLRenderer({ canvas });

    // Create scene
    const scene = new Scene();

    // Create camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);

    // Create geometry and material
    const geometry = new PlaneGeometry(2, 2);

    const material = new ShaderMaterial({
        vertexShader: `
            attribute vec3 a_position;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_modelMatrix;
            void main() {
                gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
            }
        `,
        fragmentShader: `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(gl_FragCoord.x / 500.0, 0.5, 0.5, 1.0); // Gradient effect
            }
        `,
        uniforms: {
            u_projectionMatrix: {},
            u_viewMatrix: {},
            u_modelMatrix: {},
        },
        attributes: {
            a_position: {},
        },
    });

    // Create mesh and add to scene
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const controls = new CameraControls(camera, renderer, canvas);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

}