import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls } from '../miniGL'
import { mat4 } from 'gl-matrix'

export const basicExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
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
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({ 
        color: [0.2, 0.5, 0.8, 0.8], // Semi-transparent
        transparent: true,
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
