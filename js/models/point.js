/**
 * Point class for the CAD Editor
 * Represents a point in 2D space with x and y coordinates
 */
class Point {
    /**
     * Create a new Point
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * Create a Point from an object with x and y properties
     * @param {Object} obj - The object with x and y properties
     * @returns {Point} A new Point instance
     */
    static fromObject(obj) {
        return new Point(obj.x, obj.y);
    }

    /**
     * Create a copy of this Point
     * @returns {Point} A new Point with the same coordinates
     */
    clone() {
        return new Point(this.x, this.y);
    }

    /**
     * Check if this Point is equal to another Point
     * @param {Point} point - The Point to compare with
     * @param {number} tolerance - The tolerance for equality
     * @returns {boolean} True if the points are equal within the tolerance
     */
    equals(point, tolerance = 0.001) {
        if (!point) return false;
        return Math.abs(this.x - point.x) <= tolerance && 
               Math.abs(this.y - point.y) <= tolerance;
    }

    /**
     * Calculate the distance to another Point
     * @param {Point} point - The Point to calculate distance to
     * @returns {number} The distance between the points
     */
    distanceTo(point) {
        return MathUtils.distance(this.x, this.y, point.x, point.y);
    }

    /**
     * Calculate the angle to another Point in radians
     * @param {Point} point - The Point to calculate angle to
     * @returns {number} The angle in radians
     */
    angleTo(point) {
        return MathUtils.angle(this.x, this.y, point.x, point.y);
    }

    /**
     * Calculate the angle to another Point in degrees
     * @param {Point} point - The Point to calculate angle to
     * @returns {number} The angle in degrees
     */
    angleDegreesTo(point) {
        return MathUtils.radiansToDegrees(this.angleTo(point));
    }

    /**
     * Calculate the midpoint between this Point and another Point
     * @param {Point} point - The other Point
     * @returns {Point} The midpoint
     */
    midpointTo(point) {
        const mid = MathUtils.midpoint(this.x, this.y, point.x, point.y);
        return new Point(mid.x, mid.y);
    }

    /**
     * Snap this Point to the nearest grid point
     * @param {number} gridSize - The grid size
     * @returns {Point} A new Point snapped to the grid
     */
    snapToGrid(gridSize) {
        const snapped = MathUtils.snapPointToGrid(this.x, this.y, gridSize);
        return new Point(snapped.x, snapped.y);
    }

    /**
     * Calculate a new Point at a specific distance and angle from this Point
     * @param {number} distance - The distance to the new Point
     * @param {number} angle - The angle in radians
     * @returns {Point} The new Point
     */
    pointAtDistanceAndAngle(distance, angle) {
        const point = MathUtils.pointAtDistanceAndAngle(this.x, this.y, distance, angle);
        return new Point(point.x, point.y);
    }

    /**
     * Convert this Point to a string representation
     * @returns {string} The string representation of this Point
     */
    toString() {
        return `(${MathUtils.round(this.x, 2)}, ${MathUtils.round(this.y, 2)})`;
    }

    /**
     * Convert this Point to an object with x and y properties
     * @returns {Object} The object representation of this Point
     */
    toObject() {
        return { x: this.x, y: this.y };
    }
}

// Make Point available globally
window.Point = Point; 