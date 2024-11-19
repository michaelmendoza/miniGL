# WebGL Renderer Example

This project demonstrates how to create a simple WebGL renderer with an API similar to [THREE.js](https://threejs.org/). It includes basic components such as `Scene`, `Mesh`, `Material`, `Geometry`, `Texture`, and `Camera`. The example renders a plane geometry with pan and zoom capabilities using an orthographic camera.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Example](#running-the-example)
  - [Interacting with the Scene](#interacting-with-the-scene)
- [Project Structure](#project-structure)
- [Customization](#customization)
  - [Changing Geometry](#changing-geometry)
  - [Modifying Material](#modifying-material)
  - [Using Custom Shaders](#using-custom-shaders)
- [Contributing](#contributing)
- [License](#license)

## Features

- **WebGL Renderer**: Initializes a WebGL context and handles rendering the scene.
- **Scene Graph**: Manages objects within the scene.
- **Geometries**: Includes `PlaneGeometry` and `BoxGeometry`.
- **Materials**: Supports `MeshBasicMaterial` and `ShaderMaterial`.
- **Camera**: An `OrthographicCamera` with pan and zoom capabilities.
- **Interactivity**: Mouse controls for panning and zooming.

## Demo

*Since this is a local project, please run it on your machine to view the demo.*

## Getting Started

### Prerequisites

- A modern web browser that supports WebGL (e.g., Chrome, Firefox, Edge).
- Basic understanding of HTML, CSS, and JavaScript.
- Internet connection to load the `gl-matrix` library via CDN.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/webgl-renderer-example.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd webgl-renderer-example
   ```

3. **Open the HTML File**

   Open `index.html` in your preferred web browser.

## Usage

### Running the Example

1. **Open `index.html`**

   - You can double-click the `index.html` file, or
   - Drag and drop it into your browser.

2. **View the Scene**

   - A colored plane should appear on the screen.
   - The plane can be interacted with using mouse controls.

### Interacting with the Scene

- **Pan the View**

  - **Click and Drag**: Click anywhere on the canvas and drag the mouse to pan.
  - **Effect**: Moves the camera's position horizontally and vertically.

- **Zoom In and Out**

  - **Scroll Wheel**: Use the mouse scroll wheel to zoom in or out.
  - **Effect**: Adjusts the camera's zoom level.

## Project Structure

- **`index.html`**: Main HTML file containing the canvas element and the script.
- **JavaScript Classes**:
  - **`WebGLRenderer`**: Manages the WebGL rendering context and renders the scene.
  - **`Scene`**: Holds and manages all objects within the scene.
  - **`Geometry`**: Base class for geometries.
    - **`PlaneGeometry`**: Defines a plane geometry.
    - **`BoxGeometry`**: (Optional) Defines a box geometry (full implementation needed).
  - **`Material`**: Base class for materials.
    - **`MeshBasicMaterial`**: Simple material with a solid color.
    - **`ShaderMaterial`**: Material for custom shaders.
  - **`Mesh`**: Combines geometry and material into a renderable object.
  - **`OrthographicCamera`**: Camera with orthographic projection and pan/zoom controls.
- **Utility Functions**:
  - **`compileShader`**: Compiles GLSL shader source code.
  - **`createProgram`**: Links vertex and fragment shaders into a shader program.

## Customization

### Changing Geometry

You can change the geometry from a plane to a box or any other geometry you implement.

**Example: Using `BoxGeometry`**

```javascript
// Replace PlaneGeometry with BoxGeometry
const geometry = new BoxGeometry(1, 1, 1); // Width, Height, Depth
```

### Modifying Material

Change the color or type of material used for the mesh.

**Example: Changing Material Color**

```javascript
const material = new MeshBasicMaterial({ color: [1, 0, 0, 1] }); // Red color
```

### Using Custom Shaders

Implement custom shaders using `ShaderMaterial`.

**Example: Using `ShaderMaterial`**

```javascript
const customMaterial = new ShaderMaterial({
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
            gl_FragColor = vec4(gl_FragCoord.x / 500.0, 0.5, 0.5, 1.0); // Gradient effect
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

const mesh = new Mesh(geometry, customMaterial);
scene.add(mesh);
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

---

**Note**: Ensure that the `gl-matrix` library is included in your HTML file via the CDN link provided.

---

If you have any questions or need further assistance, feel free to reach out.

---

## Acknowledgments

- [gl-matrix](http://glmatrix.net/) for matrix and vector operations.
- Inspired by [THREE.js](https://threejs.org/).

# Instructions for Running the Example

1. **Include the `gl-matrix` Library**

   The `gl-matrix` library is included via a CDN in the `<head>` of `index.html`:

   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
   ```

2. **Open `index.html` in a Browser**

   Make sure to use a browser that supports WebGL. Simply opening the file should suffice.

3. **Interact with the Canvas**

   - **Pan**: Click and drag to move around.
   - **Zoom**: Use the mouse wheel to zoom in and out.

---

# Troubleshooting

- **WebGL Support**

  If you see a message about WebGL not being supported, check if your browser supports WebGL and that hardware acceleration is enabled.

- **Console Errors**

  Open the developer console to check for any JavaScript errors.

  - **ReferenceError**: Ensure all classes are defined before they are used.
  - **Shader Compilation Errors**: Check shader code for syntax errors.

- **Canvas Not Displaying Correctly**

  Ensure the canvas dimensions are set correctly and that the `resizeCanvasToDisplaySize` function is working.


---

# Feedback

If you have suggestions or improvements, please open an issue or submit a pull request.

---

Happy coding!