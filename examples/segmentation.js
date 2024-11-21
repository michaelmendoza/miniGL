// examples/segmentationExample.js

import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls, DataTexture, DataTextureRaycaster, DataStats, DataBrush, DataSegmentationMask } from '../miniGL';

export const segmentationExample = () => {

    document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    <div id="controls" style="position: absolute; top: 10px; right: 10px; color: white; background: rgba(0,0,0,0.7); padding: 10px;">
        <label for="brushSize">Brush Size:</label>
        <input type="range" id="brushSize" name="brushSize" min="1" max="50" value="10">
        <button id="modeButton">Mode: Add</button>
    </div>
    <div id="info" style="position: absolute; top: 10px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 5px;"></div>
    <div id="stats" style="position: absolute; top: 80px; left: 10px; color: white; background: rgba(0,0,0,0.7); padding: 5px;"></div>
    `;

    // Get the canvas and info div elements
    const canvas = document.getElementById('glCanvas');
    const infoDiv = document.getElementById('info');
    const statsDiv = document.getElementById('stats');
    const brushSizeInput = document.getElementById('brushSize');
    const modeButton = document.getElementById('modeButton');

    // Variables to store the brush size and mode
    let brushSize = parseInt(brushSizeInput.value);
    let mode = 'add'; // or 'remove'

    // Event listener for brush size change
    brushSizeInput.addEventListener('input', () => {
        brushSize = parseInt(brushSizeInput.value);
        maskSegmentation.setBrushSize(brushSize);
        console.log('brushSize: ' + brushSize);
    });

    // Event listener for mode toggle
    modeButton.addEventListener('click', () => {
        mode = mode === 'add' ? 'remove' : 'add';
        modeButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        maskSegmentation.setBrushMode(mode);
        console.log('mode: ' + mode);
    });

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

    // Create data texture
    const dataTexture = new DataTexture(renderer.gl, {
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
    const maskTexture = new DataTexture(renderer.gl, {
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

    // Segmentation mask setup
    const maskSegmentation = new DataSegmentationMask(dataTexture, maskTexture, canvas, scene, camera, brushSize);
    
    const onMouseMove = (data) => {
        if (data !== null) {
            infoDiv.innerHTML = `Data Index: (${data.x}, ${data.y})<br>Value: ${data.value.toFixed(2)}`;
        } else {
            infoDiv.innerHTML = 'No intersection';
        }
    };

    const onMouseLeave = () => {
        if (infoDiv) {
            infoDiv.innerHTML = '';
        }
    };

    const onUpdate = (data) => {
        const dataStats = maskSegmentation.dataStats;
        if (dataStats.count > 0) {
            statsDiv.innerHTML = `
                <strong>Statistics for Masked Region:</strong><br>
                Mean: ${dataStats.mean.toFixed(2)}<br>
                Min: ${dataStats.min.toFixed(2)}<br>
                Max: ${dataStats.max.toFixed(2)}<br>
                Std Dev: ${dataStats.stdDev.toFixed(2)}<br>
                Count: ${dataStats.count}
            `;
        } else {
            statsDiv.innerHTML = `<strong>No data in mask.</strong>`;
        }
    };

    maskSegmentation.setEventListeners(onMouseMove, onMouseLeave, onUpdate);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

};
