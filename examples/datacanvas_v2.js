// examples/datacanvas.js

import { DataCanvas, DataLayerCanvas, MaskLayerCanvas } from '../miniGL';

export const dataCanvasExample = () => {

  // Insert CSS styles
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #1e1e1e;
        color: #ffffff;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      #glCanvas {
        display: block;
        width: 100vw;
        height: 100vh;
      }
      #ui-container {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 100vh;
        background-color: rgba(30, 30, 30, 0.9);
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
      }
      #controls {
        padding: 20px;
        border-bottom: 1px solid #444;
      }
      #brush-controls, #mode-controls {
        margin-bottom: 15px;
      }
      #brush-controls label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      #brush-controls input[type="range"] {
        width: 100%;
      }
      #mode-controls button {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        background-color: #3a3a3a;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      #mode-controls button:hover {
        background-color: #505050;
      }
      #maskLayersList {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      #maskLayersList .mask-layer {
        background-color: #2a2a2a;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
      }
      #maskLayersList .mask-layer.active {
        border-color: #00adee;
      }
      #maskLayersList .mask-layer:hover {
        background-color: #333;
      }
      #maskLayersList .mask-layer strong {
        display: block;
        margin-bottom: 10px;
        font-size: 1.1em;
      }
      #info {
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 10px;
        background-color: rgba(30, 30, 30, 0.7);
        font-size: 0.9em;
      }
    </style>
  `);

  // Update HTML structure
  document.querySelector('#app').innerHTML = `
    <canvas id="glCanvas"></canvas>
    <div id="ui-container">
      <div id="controls">
        <div id="brush-controls">
          <label for="brushSize">Brush Size</label>
          <input type="range" id="brushSize" name="brushSize" min="1" max="50" value="10">
        </div>
        <div id="mode-controls">
          <button id="modeButton">Mode: Add</button>
          <button id="addMaskLayerButton">Add Mask Layer</button>
        </div>
      </div>
      <div id="maskLayersList">
        <!-- Mask layers list will be populated here -->
      </div>
    </div>
    <div id="info">
      <!-- Info will be displayed here -->
    </div>
  `;

  // Get elements
  const infoDiv = document.getElementById('info');
  const brushSizeInput = document.getElementById('brushSize');
  const modeButton = document.getElementById('modeButton');
  const addMaskLayerButton = document.getElementById('addMaskLayerButton');
  const maskLayersList = document.getElementById('maskLayersList');

  // Variables
  let brushSize = parseInt(brushSizeInput.value);
  let mode = 'add'; // 'add' or 'remove'

  // Event listeners
  brushSizeInput.addEventListener('input', () => {
    brushSize = parseInt(brushSizeInput.value);
    dataCanvas.setBrushSize(brushSize);
  });

  modeButton.addEventListener('click', () => {
    mode = mode === 'add' ? 'remove' : 'add';
    modeButton.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    dataCanvas.setBrushMode(mode);
  });

  // Initialize DataCanvas
  const onDataLayerRaycast = (data) => {
    if (data !== null) {
      infoDiv.innerHTML = `Data Index: (${data.x}, ${data.y})<br>Value: ${data.value.toFixed(2)}`;
    } else {
      infoDiv.innerHTML = 'No intersection';
    }
  };

  const onMaskLayerRaycast = (maskLayers) => {
    // Update the mask layers list
    updateMaskLayersList();
  };

  const onMouseLeave = () => {
    infoDiv.innerHTML = '';
  };

  const dataCanvas = new DataCanvas('glCanvas', { onDataLayerRaycast, onMaskLayerRaycast, onMouseLeave });

  // Initialize layers
  const dataLayer = new DataLayerCanvas(dataCanvas.renderer, 256, 256);
  const initialMaskLayer = new MaskLayerCanvas(dataCanvas.renderer, 256, 256);

  dataCanvas.setLayers([dataLayer, initialMaskLayer]);

  // Function to update the mask layers list
  function updateMaskLayersList() {
    maskLayersList.innerHTML = ''; // Clear the list

    dataCanvas.maskLayers.forEach((maskLayer, index) => {
      const layerDiv = document.createElement('div');
      layerDiv.classList.add('mask-layer');
      if (dataCanvas.maskLayer === maskLayer) {
        layerDiv.classList.add('active');
      }

      // Update statistics for the mask layer
      maskLayer.dataStats.update(dataCanvas.dataLayer.texture.data, maskLayer.texture.data);

      // Display layer name and statistics
      layerDiv.innerHTML = `
        <strong>Mask Layer ${index + 1}</strong>
        <div>Mean: ${maskLayer.dataStats.mean.toFixed(2)}</div>
        <div>Min: ${maskLayer.dataStats.min.toFixed(2)}</div>
        <div>Max: ${maskLayer.dataStats.max.toFixed(2)}</div>
        <div>Std Dev: ${maskLayer.dataStats.stdDev.toFixed(2)}</div>
        <div>Count: ${maskLayer.dataStats.count}</div>
      `;

      // Click event to select the active mask layer
      layerDiv.addEventListener('click', () => {
        dataCanvas.maskLayer = maskLayer;
        updateMaskLayersList();
      });

      maskLayersList.appendChild(layerDiv);
    });
  }

  // Event listener for adding a new mask layer
  addMaskLayerButton.addEventListener('click', () => {
    const newMaskLayer = new MaskLayerCanvas(dataCanvas.renderer, 256, 256);
    dataCanvas.layers.push(newMaskLayer);
    dataCanvas.maskLayers.push(newMaskLayer);
    dataCanvas.scene.add(newMaskLayer.mesh);

    dataCanvas.maskLayer = newMaskLayer; // Set the new layer as active
    updateMaskLayersList();
  });

  // Generate initial data for the data layer
  const update = (dataArray, width, height) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = (x + y * width) / (width * height) * 255;
        dataArray[y * width + x] = value;
      }
    }
  };
  dataLayer.updateData(update);

  // Initial call to update the mask layers list
  updateMaskLayersList();

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    dataCanvas.render();
  }
  animate();
};
