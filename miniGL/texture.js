/** Texture class: Handles 2D textures  */
export class Texture {
    constructor(gl, options = {}) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.image = null; // For image textures
        this.data = null;  // For data textures
        this.width = options.width || 1;
        this.height = options.height || 1;
        this.format = options.format || gl.RGBA;
        this.type = options.type || gl.UNSIGNED_BYTE;
        this.wrapS = options.wrapS || gl.CLAMP_TO_EDGE;
        this.wrapT = options.wrapT || gl.CLAMP_TO_EDGE;
        this.minFilter = options.minFilter || gl.LINEAR;
        this.magFilter = options.magFilter || gl.LINEAR;
        this.flipY = options.flipY !== undefined ? options.flipY : true;
        this.onLoad = options.onLoad || null;

        // If an image or data is provided, load it
        if (options.image) {
            this.loadImage(options.image);
        } else if (options.data) {
            this.loadData(options.data);
        }
    }

    loadImage(src) {
        const gl = this.gl;
        this.image = new Image();
        this.image.src = src;
        this.image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                this.format,
                this.format,
                this.type,
                this.image
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);

            gl.bindTexture(gl.TEXTURE_2D, null);

            if (this.onLoad) {
                this.onLoad();
            }
        };

        this.image.onerror = (error) => {
            console.error('Failed to load image:', error);
            if (this.onError) {
                this.onError(error);
            }
        };
    }

    loadData(data) {
        const gl = this.gl;
        this.data = data;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            this.format,
            this.width,
            this.height,
            0,
            this.format,
            this.type,
            this.data
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);

        gl.bindTexture(gl.TEXTURE_2D, null);

        if (this.onLoad) {
            this.onLoad();
        }
    }
}

/** DataTexture class: Transforms 2D data into a 2D texture */
export class DataTexture extends Texture {
    constructor(gl, options = {}) {
        // Set default options for data textures
        options.format = options.format || gl.LUMINANCE;
        options.type = options.type || gl.UNSIGNED_BYTE;
        options.flipY = options.flipY || true;
        options.minFilter = options.minFilter || gl.NEAREST;
        options.magFilter = options.magFilter || gl.NEAREST;
        options.wrapS = options.wrapS || gl.CLAMP_TO_EDGE;
        options.wrapT = options.wrapT || gl.CLAMP_TO_EDGE;
        
        super(gl, options);
        this.data = options.data;
    }

    update(data) {
        const gl = this.gl;
        this.data = data;

        // Update the mask texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            0,
            this.width,
            this.height,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            this.data
        );
    }
}
