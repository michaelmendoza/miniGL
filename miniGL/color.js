/**
 * Convert a hexadecimal color string to RGB values.
 * 
 * @param {string} hexColor - A hexadecimal color string (with or without '#' prefix)
 *                           Example formats: '#00E5FF' or '00E5FF'
 * @returns {number[]} An array containing three numbers [r, g, b] where each value
 *                    is in the range 0-255
 * 
 * @example
 * hexToRgb('#00E5FF') // returns [0, 229, 255]
 * hexToRgb('FF0000')  // returns [255, 0, 0]
 * 
 */

export const hexToRgb = (hexColor) => {
    // Remove '#' if present
    const hex = hexColor.replace('#', '');
    
    // Convert hex to decimal values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return [r, g, b];
};

/**
 * Class to manage and generate colors for ROI segmentation masks.
 */
export class ColorGenerator {
    constructor() {
        this.index = 0;

        // Predefined colors with their hex values
        this.colors = {
            cyan: '#00E5FF',
            magenta: '#FF00E5',
            yellow: '#FFE500',
            green: '#00FF66',
            orange: '#FF9100',
            purple: '#B388FF',
            red: '#FF4444',
            blue: '#448AFF'
        };
        
        // Convert all colors
        this.rgbColors = Object.fromEntries(
            Object.entries(this.colors).map(([name, hex]) => [name, hexToRgb(hex)])
        );
    }

    nextColor() {
        const color = this.rgbColors[Object.keys(this.colors)[this.index]];
        this.index = (this.index + 1) % Object.keys(this.colors).length;
        return color;
    }
}