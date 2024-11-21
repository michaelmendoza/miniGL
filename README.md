# WebGL Renderer and Examples

This project demonstrates how to create a simple WebGL renderer with an API inspired by [THREE.js](https://threejs.org/). It includes fundamental components such as `Scene`, `Mesh`, `Material`, `Geometry`, `Texture`, and `Camera`, bundled into a minimal library called `miniGL`. The repository features several examples showcasing different functionalities like data textures, raycasting, custom shaders, blending, and interactive segmentation.

## Table of Contents

- [Features](#features)
- [Examples](#examples)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Examples](#running-the-examples)
  - [Switching Between Examples](#switching-between-examples)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Creating a Custom Example](#creating-a-custom-example)
- [Customization](#customization)
  - [Modifying Geometries](#modifying-geometries)
  - [Adjusting Materials](#adjusting-materials)
  - [Implementing Custom Shaders](#implementing-custom-shaders)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Feedback](#feedback)

## Features

- **WebGL Renderer (`miniGL`)**: A minimal WebGL rendering library with core components.
- **Scene Graph**: Manages objects within the scene.
- **Geometries**: Includes `PlaneGeometry` and `BoxGeometry`.
- **Materials**: Supports `MeshBasicMaterial` and `ShaderMaterial`.
- **Textures**: Handles image textures and data textures (`Texture`, `DataTexture`).
- **Camera**: An `OrthographicCamera` with pan and zoom capabilities.
- **Interactivity**: Mouse controls for panning, zooming, and object interaction.
- **Raycaster**: For detecting mouse intersections with objects.
- **Examples**: Multiple examples demonstrating various features.

## Examples

The project includes the following examples:

- **Basic Example (`basic.js`)**: Renders a simple plane with basic material.
- **Custom Shader Example (`shader.js`)**: Demonstrates how to use custom vertex and fragment shaders.
- **Data Texture Example (`data.js`)**: Shows how to create and render data textures.
- **Texture Example (`texture.js`)**: Displays an image texture on a plane.
- **Raycaster Example (`raycaster.js`)**: Implements mouse interaction to read data texture values.
- **Segmentation Example (`segmentation.js`)**: Interactive segmentation using a brush tool with real-time statistics.
- **Blending Example (`blend.js`)**: Demonstrates blending and transparency.

## Getting Started

### Prerequisites

- **Node.js and npm**: Ensure you have [Node.js](https://nodejs.org/) and npm installed.
- **Modern Web Browser**: A browser that supports WebGL (e.g., Chrome, Firefox, Edge).

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/webgl-renderer-examples.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd webgl-renderer-examples
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

## Running the Examples

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

   This command uses Vite to start a local development server.

2. **Open in Browser**

   Open your web browser and navigate to `http://localhost:3000` (the port number may vary; check the console output).

3. **Interact with the Example**

   The default example (`segmentation.js`) will be running. You can interact with it as described in the [Examples](#examples) section.

### Switching Between Examples

To switch between different examples:

1. **Open `main.js` in the Project Root**

2. **Comment/Uncomment the Example You Want to Run**

   ```javascript
   // Import statements...
   // basicExample();
   // customShaderExample();
   // dataTextureExample();
   // textureExample();
   // dataTextureRaycastExample();
   segmentationExample(); // This example is currently active
   // blendingExample();
   ```

   Uncomment the example you want to run and comment out the others.

3. **Save the File**

   Vite will automatically reload the page with the selected example.

## Project Structure

- **`index.html`**: Main HTML file that includes the app root and script imports.
- **`main.js`**: Entry point for the application; selects which example to run.
- **`miniGL/`**: Directory containing the `miniGL` library source code.
  - **`renderer.js`**: Manages the WebGL rendering context and renders the scene.
  - **`mesh.js`**: Defines the `Mesh` class.
  - **`material.js`**: Contains material classes like `MeshBasicMaterial` and `ShaderMaterial`.
  - **`geometry.js`**: Provides geometry classes like `PlaneGeometry` and `BoxGeometry`.
  - **`texture.js`**: Handles textures (`Texture` and `DataTexture` classes).
  - **`camera.js`**: Implements the `OrthographicCamera` with controls.
  - **`controls.js`**: Contains camera control classes for interaction.
  - **`raycaster.js`**: Implements raycasting for object intersection.
  - **`webgl.js`**: Utility functions for shader compilation and program creation.
- **`examples/`**: Directory containing example scripts.
  - **`basic.js`**: Basic rendering example.
  - **`shader.js`**: Custom shader example.
  - **`data.js`**: Data texture example.
  - **`texture.js`**: Image texture example.
  - **`raycaster.js`**: Raycasting example.
  - **`segmentation.js`**: Segmentation with brush tool and statistics.
  - **`blend.js`**: Blending and transparency example.

## Usage

### Creating a Custom Example

1. **Create a New File in `examples/`**

   For example, `myExample.js`.

2. **Import Necessary Modules**

   ```javascript
   import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, CameraControls } from '../miniGL';
   ```

3. **Set Up the Scene**

   ```javascript
   export const myExample = () => {
     // Set up code here...
   };
   ```

4. **Update `main.js`**

   Import and activate your new example:

   ```javascript
   import { myExample } from './examples/myExample';
   myExample();
   ```

## Customization

### Modifying Geometries

You can change the geometry of objects in the scene.

**Example: Using `BoxGeometry`**

```javascript
import { BoxGeometry } from '../miniGL';

const geometry = new BoxGeometry(1, 1, 1); // Width, Height, Depth
```

### Adjusting Materials

Customize the appearance by modifying material properties.

**Example: Changing Material Color and Transparency**

```javascript
const material = new MeshBasicMaterial({
  color: [0.5, 0.8, 0.2, 0.7], // RGBA values
  transparent: true,
});
```

### Implementing Custom Shaders

Use `ShaderMaterial` to apply custom shaders.

**Example: Creating a Gradient Effect**

```javascript
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
      gl_FragColor = vec4(gl_FragCoord.x / 500.0, gl_FragCoord.y / 500.0, 0.5, 1.0);
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
```

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. **Fork the Repository**

   Click on the 'Fork' button at the top right of the repository page.

2. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   Implement your features or bug fixes.

4. **Commit Changes**

   ```bash
   git commit -am 'Add new feature'
   ```

5. **Push to Your Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

   Open a pull request on the original repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [gl-matrix](http://glmatrix.net/) for matrix and vector operations.
- Inspired by [THREE.js](https://threejs.org/).
- Built using [Vite](https://vitejs.dev/) for development server and bundling.

## Feedback

If you have suggestions or improvements, please open an issue or submit a pull request.

---

Happy coding!

---

# Additional Information

## Installing Dependencies

This project uses npm for package management. The `gl-matrix` library and other dependencies are installed via npm and imported as ES modules.

## Development Scripts

- **Start Development Server**

  ```bash
  npm run dev
  ```

- **Build for Production**

  ```bash
  npm run build
  ```

- **Preview Production Build**

  ```bash
  npm run preview
  ```

## Troubleshooting

- **WebGL Support**

  If you see a message about WebGL not being supported, check if your browser supports WebGL and that hardware acceleration is enabled.

- **Console Errors**

  Open the developer console to check for any JavaScript errors.

  - **Module Not Found**: Ensure all imports are correct and dependencies are installed.
  - **Shader Compilation Errors**: Check shader code for syntax errors.

- **Canvas Not Displaying Correctly**

  Ensure the canvas dimensions are set correctly and that the `resize` function is working.

## Interacting with the Examples

### Segmentation Example (`segmentation.js`)

- **Brush Size Adjustment**

  Use the brush size slider in the top-right corner to adjust the size of the brush.

- **Mode Toggle**

  Click the "Mode" button to switch between "Add" and "Remove" modes for the segmentation mask.

- **Drawing**

  Click and drag on the canvas to draw with the brush. The segmentation mask will update in real-time.

- **Statistics**

  Real-time statistics (mean, min, max, standard deviation, and count) of the masked region are displayed.

### Raycaster Example (`raycaster.js`)

- **Data Inspection**

  Move the mouse over the canvas to inspect data values at different points.

- **Click Interaction**

  Click on the canvas to log UV coordinates and data values to the console.

---

Feel free to explore the different examples and modify the code to better understand how each component works.

---

# Note on `miniGL` Library

The `miniGL` library is a minimalistic WebGL library created for educational purposes. It provides a simplified interface for common WebGL operations, making it easier to get started with WebGL programming without the overhead of larger libraries.

Key components include:

- **Renderer**: Manages the WebGL context and rendering loop.
- **Scene**: Organizes objects in the scene.
- **Camera**: Handles projection and view matrices.
- **Geometry**: Defines shapes and structures.
- **Material**: Defines how objects appear.
- **Mesh**: Combines geometry and material into renderable objects.
- **Controls**: Provides interaction capabilities like pan and zoom.
- **Raycaster**: Enables mouse interaction with objects.

---

# Getting Help

If you encounter issues or have questions:

- **Check the Documentation**: Review comments and documentation within the code.
- **Search Online**: Look for solutions related to WebGL and the specific issue.
- **Open an Issue**: If you believe there's a problem with the code, open an issue in the repository.

---

Enjoy experimenting with WebGL and creating your own interactive graphics applications!