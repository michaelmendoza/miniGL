// examples/dataTextureExample.js

import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls, DataTexture } from '../miniGL';

export const dataTextureExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
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

    // Create a Texture instance
    const gl = renderer.gl;
    const texture = new DataTexture(gl, {
        data: dataArray,
        width: width,
        height: height
    });

    // Create material with map
    const material = new MeshBasicMaterial({
        color: [1, 1, 1, 1], // White color to see the texture as is
        map: texture
    });

    // Create mesh and add to scene
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

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
