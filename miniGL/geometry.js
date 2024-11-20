// Base class for geometries
export class Geometry {
    constructor() {
        this.vertices = [];
        this.indices = [];
        this.uvs = [];
        this.normals = [];
    }
}

// PlaneGeometry class
export class PlaneGeometry extends Geometry {
    constructor(width = 1, height = 1) {
        super();
        const w = width / 2;
        const h = height / 2;
        this.vertices = new Float32Array([
            -w, -h, 0,
                w, -h, 0,
                w,  h, 0,
            -w,  h, 0,
        ]);
        this.indices = new Uint16Array([
            0, 1, 2,
            2, 3, 0,
        ]);
        this.uvs = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);
        this.normals = new Float32Array([
            0, 0, 1, // Normal for vertex 0
            0, 0, 1, // Normal for vertex 1
            0, 0, 1, // Normal for vertex 2
            0, 0, 1, // Normal for vertex 3
        ]);
    }
}

// BoxGeometry class
export class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1) {
        super();
        const w = width / 2;
        const h = height / 2;
        const d = depth / 2;

        // Define vertices
        this.vertices = new Float32Array([
            // Front face
            -w, -h,  d,
             w, -h,  d,
             w,  h,  d,
            -w,  h,  d,
            // Back face
            -w, -h, -d,
            -w,  h, -d,
             w,  h, -d,
             w, -h, -d,
            // Top face
            -w,  h, -d,
            -w,  h,  d,
             w,  h,  d,
             w,  h, -d,
            // Bottom face
            -w, -h, -d,
             w, -h, -d,
             w, -h,  d,
            -w, -h,  d,
            // Right face
             w, -h, -d,
             w,  h, -d,
             w,  h,  d,
             w, -h,  d,
            // Left face
            -w, -h, -d,
            -w, -h,  d,
            -w,  h,  d,
            -w,  h, -d,
        ]);

        // Define indices
        this.indices = new Uint16Array([
            0, 1, 2,   2, 3, 0,    // Front face
            4, 5, 6,   6, 7, 4,    // Back face
            8, 9,10,  10,11, 8,    // Top face
           12,13,14,  14,15,12,   // Bottom face
           16,17,18,  18,19,16,   // Right face
           20,21,22,  22,23,20,   // Left face
        ]);

        // Define UVs
        this.uvs = new Float32Array([
            // Front face
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            // Back face
            1, 0,
            1, 1,
            0, 1,
            0, 0,
            // Top face
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            // Bottom face
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            // Right face
            1, 0,
            1, 1,
            0, 1,
            0, 0,
            // Left face
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]);

        // Define normals
        this.normals = new Float32Array([
            // Front face normals
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            // Back face normals
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            // Top face normals
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            // Bottom face normals
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            // Right face normals
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            // Left face normals
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ]);
    }
}