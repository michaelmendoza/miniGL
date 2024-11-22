// examples/dataTextureExample.js

import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls, DataTexture, DataTextureRaycaster } from '../miniGL';

export const dataTextureRaycastExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    <div id="info" style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 5px;"></div>
    `;

    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    const infoDiv = document.getElementById('info');

    // Initialize renderer
    const renderer = new WebGLRenderer({ canvas });

    // Create scene
    const scene = new Scene();

    // Create camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);

    // Create geometry
    const geometry = new PlaneGeometry(2, 2);

    // Create data array with increasing values
    const width = 256;
    const height = 256;
    const dataArray = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = (x + y * width) / (width * height) * 255;
            dataArray[y * width + x] = value;
        }
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

    // Raycaster
    const raycaster = new DataTextureRaycaster(texture, canvas, camera, scene.children);

    // Canvas click event listener
    canvas.addEventListener('click', (event) => {
        raycaster.intersectData(event, (data) => {            
            if (data !== null) {
                console.log(`Clicked at UV: (${data.x.toFixed(3)}, ${data.y.toFixed(3)})`);
                console.log(`Data value at (${data.x}, ${data.y}): ${data.value}`);
            } else { 
                console.log('No intersection');
            }
        });   
    });

    // Mouse move event listener
    canvas.addEventListener('mousemove', (event) => {
        raycaster.intersectData(event, (data) => {     
            if (data !== null) {
                infoDiv.innerHTML = `Data Index: (${data.x}, ${data.y})<br>Value: ${data.value.toFixed(2)}`;
            } else {
                infoDiv.innerHTML = 'No intersection';
            }
        });   
    });

    // Mouse leave event listener to clear info
    canvas.addEventListener('mouseleave', () => {
        infoDiv.innerHTML = '';
    });

};
