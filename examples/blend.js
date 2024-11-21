import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls } from '../miniGL'
import { mat4 } from 'gl-matrix'

export const blendingExample = () => {

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

    // Create background geometry and material (opaque)
    const geometry2 = new PlaneGeometry(2, 2);
    const material2 = new MeshBasicMaterial({ 
        color: [1.0, 0, 0, 1], 
        transparent: false, // Opaque material
    });

    // Create background mesh and add to scene
    const mesh2 = new Mesh(geometry2, material2);
    scene.add(mesh2); // Add opaque background first

    // Create foreground geometry and material (transparent)
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({ 
        color: [0.2, 0.5, 0.8, 0.8], // Semi-transparent
        transparent: true,
    });

    // Create foreground mesh and add to scene
    const mesh = new Mesh(geometry, material);
    mesh.translate(0, 0, 0.01);
    scene.add(mesh); // Add transparent foreground after

    const controls = new CameraControls(camera, renderer, canvas);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
