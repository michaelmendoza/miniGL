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
