/**
 * Rectangle class for the CAD Editor
 * Represents a rectangle defined by its top-left corner, width, and height
 */
class Rectangle {
    /**
     * Create a new Rectangle
     * @param {number} x - X coordinate of the top-left corner
     * @param {number} y - Y coordinate of the top-left corner
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     */
    constructor(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        
        // Ensure width and height are positive
        this.width = Math.abs(width || 0);
        this.height = Math.abs(height || 0);
        
        this.type = 'rectangle';
        this.id = `rectangle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create a Rectangle from two points (opposite corners)
     * @param {Point} p1 - First corner point
     * @param {Point} p2 - Second corner point (opposite to p1)
     * @returns {Rectangle} A new Rectangle instance
     */
    static fromPoints(p1, p2) {
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);
        
        return new Rectangle(x, y, width, height);
    }

    /**
     * Create a Rectangle from an object with x, y, width, height properties
     * @param {Object} obj - The object with rectangle properties
     * @returns {Rectangle} A new Rectangle instance
     */
    static fromObject(obj) {
        return new Rectangle(obj.x, obj.y, obj.width, obj.height);
    }

    /**
     * Get the top-left corner of this Rectangle
     * @returns {Point} The top-left corner
     */
    getTopLeft() {
        return new Point(this.x, this.y);
    }

    /**
     * Get the top-right corner of this Rectangle
     * @returns {Point} The top-right corner
     */
    getTopRight() {
        return new Point(this.x + this.width, this.y);
    }

    /**
     * Get the bottom-left corner of this Rectangle
     * @returns {Point} The bottom-left corner
     */
    getBottomLeft() {
        return new Point(this.x, this.y + this.height);
    }

    /**
     * Get the bottom-right corner of this Rectangle
     * @returns {Point} The bottom-right corner
     */
    getBottomRight() {
        return new Point(this.x + this.width, this.y + this.height);
    }

    /**
     * Get the center point of this Rectangle
     * @returns {Point} The center point
     */
    getCenter() {
        return new Point(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }

    /**
     * Get the area of this Rectangle
     * @returns {number} The area
     */
    getArea() {
        return this.width * this.height;
    }

    /**
     * Get the perimeter of this Rectangle
     * @returns {number} The perimeter
     */
    getPerimeter() {
        return 2 * (this.width + this.height);
    }

    /**
     * Check if a point is inside this Rectangle
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @returns {boolean} True if the point is inside the rectangle
     */
    containsPoint(x, y) {
        return MathUtils.isPointInRectangle(x, y, this.x, this.y, this.width, this.height);
    }

    /**
     * Check if this Rectangle contains another Rectangle
     * @param {Rectangle} rect - The other Rectangle
     * @returns {boolean} True if this Rectangle contains the other Rectangle
     */
    containsRectangle(rect) {
        return (
            rect.x >= this.x &&
            rect.y >= this.y &&
            rect.x + rect.width <= this.x + this.width &&
            rect.y + rect.height <= this.y + this.height
        );
    }

    /**
     * Check if this Rectangle intersects with another Rectangle
     * @param {Rectangle} rect - The other Rectangle
     * @returns {boolean} True if the rectangles intersect
     */
    intersectsWithRectangle(rect) {
        return MathUtils.rectanglesIntersect(
            this.x, this.y, this.width, this.height,
            rect.x, rect.y, rect.width, rect.height
        );
    }

    /**
     * Check if this Rectangle intersects with a Line
     * @param {Line} line - The Line
     * @returns {boolean} True if the rectangle intersects with the line
     */
    intersectsWithLine(line) {
        return line.intersectsWithRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Create a copy of this Rectangle
     * @returns {Rectangle} A new Rectangle with the same properties
     */
    clone() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    /**
     * Check if this Rectangle is equal to another Rectangle
     * @param {Rectangle} rect - The Rectangle to compare with
     * @param {number} tolerance - The tolerance for equality
     * @returns {boolean} True if the rectangles are equal within the tolerance
     */
    equals(rect, tolerance = 0.001) {
        if (!rect) return false;
        
        return (
            Math.abs(this.x - rect.x) <= tolerance &&
            Math.abs(this.y - rect.y) <= tolerance &&
            Math.abs(this.width - rect.width) <= tolerance &&
            Math.abs(this.height - rect.height) <= tolerance
        );
    }

    /**
     * Move this Rectangle by a specified offset
     * @param {number} dx - The x offset
     * @param {number} dy - The y offset
     */
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Resize this Rectangle
     * @param {number} newWidth - The new width
     * @param {number} newHeight - The new height
     */
    resize(newWidth, newHeight) {
        this.width = Math.max(0, newWidth);
        this.height = Math.max(0, newHeight);
    }

    /**
     * Snap this Rectangle to the grid
     * @param {number} gridSize - The grid size
     */
    snapToGrid(gridSize) {
        const snappedTopLeft = MathUtils.snapPointToGrid(this.x, this.y, gridSize);
        const snappedBottomRight = MathUtils.snapPointToGrid(
            this.x + this.width,
            this.y + this.height,
            gridSize
        );
        
        this.x = snappedTopLeft.x;
        this.y = snappedTopLeft.y;
        this.width = snappedBottomRight.x - snappedTopLeft.x;
        this.height = snappedBottomRight.y - snappedTopLeft.y;
    }

    /**
     * Get the four lines that make up the edges of this Rectangle
     * @returns {Array<Line>} The four edge lines
     */
    getEdgeLines() {
        const topLeft = this.getTopLeft();
        const topRight = this.getTopRight();
        const bottomLeft = this.getBottomLeft();
        const bottomRight = this.getBottomRight();
        
        return [
            new Line(topLeft.x, topLeft.y, topRight.x, topRight.y),         // Top
            new Line(topRight.x, topRight.y, bottomRight.x, bottomRight.y), // Right
            new Line(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y), // Bottom
            new Line(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)      // Left
        ];
    }

    /**
     * Generate the SVG path data for this Rectangle
     * @returns {string} The SVG path data
     */
    toSVGPathData() {
        return `M ${this.x} ${this.y} H ${this.x + this.width} V ${this.y + this.height} H ${this.x} Z`;
    }

    /**
     * Generate an SVG element for this Rectangle
     * @returns {SVGElement} The SVG rect element
     */
    toSVGElement() {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', this.x);
        rect.setAttribute('y', this.y);
        rect.setAttribute('width', this.width);
        rect.setAttribute('height', this.height);
        rect.setAttribute('data-id', this.id);
        rect.setAttribute('data-type', this.type);
        return rect;
    }

    /**
     * Convert this Rectangle to a string representation
     * @returns {string} The string representation of this Rectangle
     */
    toString() {
        return `Rectangle at (${MathUtils.round(this.x, 2)}, ${MathUtils.round(this.y, 2)}) with width ${MathUtils.round(this.width, 2)} and height ${MathUtils.round(this.height, 2)}`;
    }

    /**
     * Convert this Rectangle to an object
     * @returns {Object} The object representation of this Rectangle
     */
    toObject() {
        return {
            type: this.type,
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Make Rectangle available globally
window.Rectangle = Rectangle; 