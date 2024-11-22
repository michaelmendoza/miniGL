// examples/segmentationExample.js

import { DataCanvas, DataLayerCanvas, MaskLayerCanvas } from '../miniGL';

export const dataCanvasExample = () => {

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
        dataCanvas.setBrushSize(brushSize);
        console.log('brushSize: ' + brushSize);
    });

    // Event listener for mode toggle
    modeButton.addEventListener('click', () => {
        mode = mode === 'add' ? 'remove' : 'add';
        modeButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        dataCanvas.setBrushMode(mode);
        console.log('mode: ' + mode);
    });

    const onDataLayerRaycast = (data) => {
        if (data !== null) {
            infoDiv.innerHTML = `Data Index: (${data.x}, ${data.y})<br>Value: ${data.value.toFixed(2)}`;
        } else {
            infoDiv.innerHTML = 'No intersection';
        }
    };

    const onMaskLayerRaycast = (layer) => {
        const dataStats = layer.dataStats;
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


    const onMouseLeave = () => {
        if (infoDiv) {
            infoDiv.innerHTML = '';
        }
    };

    const dataCanvas = new DataCanvas('glCanvas', { onDataLayerRaycast, onMaskLayerRaycast, onMouseLeave });
    const layers = [
        new DataLayerCanvas(dataCanvas.renderer, 256, 256),
        new MaskLayerCanvas(dataCanvas.renderer, 256, 256),
    ];
    dataCanvas.setLayers(layers);

    const update = (dataArray, width, height) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = (x + y * width) / (width * height) * 255;
                dataArray[y * width + x] = value;
            }
        }
    };
    layers[0].updateData(update);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        dataCanvas.render();
    }
    animate();

};
