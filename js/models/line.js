/**
 * Line class for the CAD Editor
 * Represents a line segment between two points
 */
class Line {
    /**
     * Create a new Line
     * @param {number} x1 - X coordinate of the start point
     * @param {number} y1 - Y coordinate of the start point
     * @param {number} x2 - X coordinate of the end point
     * @param {number} y2 - Y coordinate of the end point
     */
    constructor(x1, y1, x2, y2) {
        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
        this.type = 'line';
        this.id = `line_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create a Line from two Point objects
     * @param {Point} start - The start point
     * @param {Point} end - The end point
     * @returns {Line} A new Line instance
     */
    static fromPoints(start, end) {
        return new Line(start.x, start.y, end.x, end.y);
    }

    /**
     * Create a Line from an object with x1, y1, x2, y2 properties
     * @param {Object} obj - The object with line properties
     * @returns {Line} A new Line instance
     */
    static fromObject(obj) {
        return new Line(obj.x1, obj.y1, obj.x2, obj.y2);
    }

    /**
     * Get the start point of this Line
     * @returns {Point} The start point
     */
    getStartPoint() {
        return new Point(this.x1, this.y1);
    }

    /**
     * Get the end point of this Line
     * @returns {Point} The end point
     */
    getEndPoint() {
        return new Point(this.x2, this.y2);
    }

    /**
     * Get the midpoint of this Line
     * @returns {Point} The midpoint
     */
    getMidpoint() {
        return new Point(
            (this.x1 + this.x2) / 2,
            (this.y1 + this.y2) / 2
        );
    }

    /**
     * Get the length of this Line
     * @returns {number} The length
     */
    getLength() {
        return MathUtils.distance(this.x1, this.y1, this.x2, this.y2);
    }

    /**
     * Get the angle of this Line in radians
     * @returns {number} The angle in radians
     */
    getAngle() {
        return MathUtils.angle(this.x1, this.y1, this.x2, this.y2);
    }

    /**
     * Get the angle of this Line in degrees
     * @returns {number} The angle in degrees
     */
    getAngleDegrees() {
        return MathUtils.radiansToDegrees(this.getAngle());
    }

    /**
     * Check if a point is on this Line
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @param {number} tolerance - Distance tolerance
     * @returns {boolean} True if the point is on the line
     */
    isPointOnLine(x, y, tolerance = 5) {
        return MathUtils.isPointOnLine(x, y, this.x1, this.y1, this.x2, this.y2, tolerance);
    }

    /**
     * Calculate the intersection with another Line
     * @param {Line} line - The other Line
     * @returns {Point|null} The intersection point or null if no intersection
     */
    intersectWith(line) {
        const intersection = MathUtils.lineIntersection(
            this.x1, this.y1, this.x2, this.y2,
            line.x1, line.y1, line.x2, line.y2
        );
        
        return intersection ? new Point(intersection.x, intersection.y) : null;
    }

    /**
     * Create a copy of this Line
     * @returns {Line} A new Line with the same coordinates
     */
    clone() {
        return new Line(this.x1, this.y1, this.x2, this.y2);
    }

    /**
     * Check if this Line is equal to another Line
     * @param {Line} line - The Line to compare with
     * @param {number} tolerance - The tolerance for equality
     * @returns {boolean} True if the lines are equal within the tolerance
     */
    equals(line, tolerance = 0.001) {
        if (!line) return false;
        
        // Check if points match exactly
        const exactMatch = 
            Math.abs(this.x1 - line.x1) <= tolerance && 
            Math.abs(this.y1 - line.y1) <= tolerance && 
            Math.abs(this.x2 - line.x2) <= tolerance && 
            Math.abs(this.y2 - line.y2) <= tolerance;
            
        if (exactMatch) return true;
        
        // Check if points match in reverse order
        const reverseMatch = 
            Math.abs(this.x1 - line.x2) <= tolerance && 
            Math.abs(this.y1 - line.y2) <= tolerance && 
            Math.abs(this.x2 - line.x1) <= tolerance && 
            Math.abs(this.y2 - line.y1) <= tolerance;
            
        return reverseMatch;
    }

    /**
     * Move this Line by a specified offset
     * @param {number} dx - The x offset
     * @param {number} dy - The y offset
     */
    move(dx, dy) {
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }

    /**
     * Snap this Line to the grid
     * @param {number} gridSize - The grid size
     */
    snapToGrid(gridSize) {
        const start = MathUtils.snapPointToGrid(this.x1, this.y1, gridSize);
        const end = MathUtils.snapPointToGrid(this.x2, this.y2, gridSize);
        
        this.x1 = start.x;
        this.y1 = start.y;
        this.x2 = end.x;
        this.y2 = end.y;
    }

    /**
     * Check if this Line is horizontal
     * @param {number} tolerance - The tolerance in degrees
     * @returns {boolean} True if the line is horizontal
     */
    isHorizontal(tolerance = 1) {
        const angle = Math.abs(this.getAngleDegrees());
        return angle < tolerance || Math.abs(angle - 180) < tolerance;
    }

    /**
     * Check if this Line is vertical
     * @param {number} tolerance - The tolerance in degrees
     * @returns {boolean} True if the line is vertical
     */
    isVertical(tolerance = 1) {
        const angle = Math.abs(this.getAngleDegrees());
        return Math.abs(angle - 90) < tolerance || Math.abs(angle - 270) < tolerance;
    }

    /**
     * Get the bounding box of this Line
     * @returns {Object} The bounding box {x, y, width, height}
     */
    getBoundingBox() {
        const minX = Math.min(this.x1, this.x2);
        const minY = Math.min(this.y1, this.y2);
        const maxX = Math.max(this.x1, this.x2);
        const maxY = Math.max(this.y1, this.y2);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Check if this Line intersects with a rectangle
     * @param {number} x - X coordinate of the rectangle's top-left corner
     * @param {number} y - Y coordinate of the rectangle's top-left corner
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @returns {boolean} True if the line intersects with the rectangle
     */
    intersectsWithRect(x, y, width, height) {
        // Check if either endpoint is inside the rectangle
        if (MathUtils.isPointInRectangle(this.x1, this.y1, x, y, width, height) ||
            MathUtils.isPointInRectangle(this.x2, this.y2, x, y, width, height)) {
            return true;
        }
        
        // Check if the line intersects with any of the rectangle's edges
        const rectLines = [
            new Line(x, y, x + width, y),                  // Top
            new Line(x + width, y, x + width, y + height), // Right
            new Line(x + width, y + height, x, y + height), // Bottom
            new Line(x, y + height, x, y)                  // Left
        ];
        
        for (const rectLine of rectLines) {
            if (this.intersectWith(rectLine)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate the SVG path data for this Line
     * @returns {string} The SVG path data
     */
    toSVGPathData() {
        return `M ${this.x1} ${this.y1} L ${this.x2} ${this.y2}`;
    }

    /**
     * Generate an SVG element for this Line
     * @returns {SVGElement} The SVG line element
     */
    toSVGElement() {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', this.x1);
        line.setAttribute('y1', this.y1);
        line.setAttribute('x2', this.x2);
        line.setAttribute('y2', this.y2);
        line.setAttribute('data-id', this.id);
        line.setAttribute('data-type', this.type);
        return line;
    }

    /**
     * Convert this Line to a string representation
     * @returns {string} The string representation of this Line
     */
    toString() {
        return `Line from ${this.getStartPoint().toString()} to ${this.getEndPoint().toString()}`;
    }

    /**
     * Convert this Line to an object
     * @returns {Object} The object representation of this Line
     */
    toObject() {
        return {
            type: this.type,
            id: this.id,
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        };
    }
}

// Make Line available globally
window.Line = Line; 