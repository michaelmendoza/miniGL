import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls } from '../miniGL'

export const basicExample = () => {

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
    const material = new MeshBasicMaterial({ color: [0.2, 0.5, 0.8, 1] });

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