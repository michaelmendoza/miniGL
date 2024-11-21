// examples/segmentationExample.js

import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls, DataTexture, Raycaster } from '../miniGL';
import { mat4 } from 'gl-matrix';

export const segmentationExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    <div id="info" style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 5px;"></div>
    <div id="stats" style="position: absolute; top: 80px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 5px;"></div>
    `;

    // Get the canvas and info div elements
    const canvas = document.getElementById('glCanvas');
    const infoDiv = document.getElementById('info');
    const statsDiv = document.getElementById('stats');

    // Initialize renderer
    const renderer = new WebGLRenderer({ canvas });

    // Enable blending for transparency
    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    // Create data texture
    const dataTexture = new DataTexture(gl, {
        data: dataArray,
        width: width,
        height: height,
    });

    // Create data texture material
    const dataMaterial = new MeshBasicMaterial({
        color: [1, 1, 1, 1], // White color to see the texture as is
        map: dataTexture
    });

    // Create data mesh and add to scene
    const dataMesh = new Mesh(geometry, dataMaterial);
    scene.add(dataMesh);

    // Create segmentation mask array (initially all zeros)
    const maskArray = new Uint8Array(width * height);

    // Create mask texture
    const maskTexture = new DataTexture(gl, {
        data: maskArray,
        width: width,
        height: height,
    });

    // Create mask material with blending
    const maskMaterial = new MeshBasicMaterial({
        color: [1, 0, 0, 0.5], // Semi-transparent red
        map: maskTexture,
        transparent: true,
    });

    // Create mask mesh and add to scene (add after dataMesh so it renders on top)
    const maskMesh = new Mesh(geometry, maskMaterial);
    maskMesh.translate(0, 0, 0.01);
    scene.add(maskMesh);

    // Camera controls
    const controls = new CameraControls(camera, renderer, canvas, { useDrag: false });

    // Raycaster
    const raycaster = new Raycaster();

    // Variables to store statistics
    let maskValues = [];
    let mean = 0;
    let min = 0;
    let max = 0;
    let stdDev = 0;

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Mouse move event listener
    canvas.addEventListener('mousemove', (event) => {
        // Get mouse NDC coordinates
        const ndcCoords = getMouseNDC(event, canvas);

        // Set ray from camera
        raycaster.setFromCamera(ndcCoords, camera);

        // Intersect objects in the scene
        const intersects = raycaster.intersectObject(dataMesh);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const uv = intersect.uv;

            // Compute data texture value at the UV coordinates
            const u = uv[0];
            const v = uv[1];

            // Data texture coordinates
            const x = Math.floor(u * (width - 1));
            const y = Math.floor((1 - v) * (height - 1)); // Flip Y axis

            const index = y * width + x;
            const value = dataArray[index];

            infoDiv.innerHTML = `Data Index: (${x}, ${y})<br>Value: ${value.toFixed(2)}`;
        } else {
            infoDiv.innerHTML = 'No intersection';
        }
    });

    // Mouse leave event listener to clear info
    canvas.addEventListener('mouseleave', () => {
        infoDiv.innerHTML = '';
    });

    // Mouse click event listener to toggle mask
    canvas.addEventListener('click', (event) => {
        // Get mouse NDC coordinates
        const ndcCoords = getMouseNDC(event, canvas);

        // Set ray from camera
        raycaster.setFromCamera(ndcCoords, camera);

        // Intersect with dataMesh (or maskMesh)
        const intersects = raycaster.intersectObject(dataMesh);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const uv = intersect.uv;

            const u = uv[0];
            const v = uv[1];

            // Data texture coordinates
            const x = Math.floor(u * (width - 1) + 0.5);
            const y = Math.floor((1 - v) * (height - 1) + 0.5); // Flip Y axis

            const index = y * width + x;

            // Toggle mask value
            maskArray[index] = maskArray[index] === 0 ? 255 : 0;

            // Update the mask texture with the new mask array
            maskTexture.update(maskArray);

            // Recalculate statistics
            updateStatistics();
        }
    });

    // Function to update statistics based on the mask
    function updateStatistics() {
        maskValues = [];

        for (let i = 0; i < maskArray.length; i++) {
            if (maskArray[i] === 1) {
                maskValues.push(dataArray[i]);
            }
        }

        if (maskValues.length > 0) {
            const sum = maskValues.reduce((a, b) => a + b, 0);
            mean = sum / maskValues.length;

            min = Math.min(...maskValues);
            max = Math.max(...maskValues);

            const variance = maskValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / maskValues.length;
            stdDev = Math.sqrt(variance);

            statsDiv.innerHTML = `
                <strong>Statistics for Masked Region:</strong><br>
                Mean: ${mean.toFixed(2)}<br>
                Min: ${min.toFixed(2)}<br>
                Max: ${max.toFixed(2)}<br>
                Std Dev: ${stdDev.toFixed(2)}<br>
                Count: ${maskValues.length}
            `;
        } else {
            statsDiv.innerHTML = `<strong>No data in mask.</strong>`;
        }
    }

    // Function to convert mouse event to NDC coordinates
    function getMouseNDC(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        const y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
        return { x: x, y: y };
    }
};
