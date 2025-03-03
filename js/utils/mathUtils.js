/**
 * Math utilities for the CAD Editor
 * Provides geometric calculations and transformations
 */
const MathUtils = {
    /**
     * Calculate the distance between two points
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {number} The distance between the points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * Calculate the angle between two points in radians
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {number} The angle in radians
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Calculate the angle between two points in degrees
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {number} The angle in degrees
     */
    angleDegrees(x1, y1, x2, y2) {
        return this.radiansToDegrees(this.angle(x1, y1, x2, y2));
    },

    /**
     * Convert radians to degrees
     * @param {number} radians - The angle in radians
     * @returns {number} The angle in degrees
     */
    radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Convert degrees to radians
     * @param {number} degrees - The angle in degrees
     * @returns {number} The angle in radians
     */
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Round a number to a specified precision
     * @param {number} value - The value to round
     * @param {number} precision - The number of decimal places
     * @returns {number} The rounded value
     */
    round(value, precision = 2) {
        const factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    },

    /**
     * Check if a point is on a line segment
     * @param {number} px - X coordinate of the point
     * @param {number} py - Y coordinate of the point
     * @param {number} x1 - X coordinate of the line start
     * @param {number} y1 - Y coordinate of the line start
     * @param {number} x2 - X coordinate of the line end
     * @param {number} y2 - Y coordinate of the line end
     * @param {number} tolerance - Distance tolerance
     * @returns {boolean} True if the point is on the line segment
     */
    isPointOnLine(px, py, x1, y1, x2, y2, tolerance = 5) {
        // Calculate the distance from point to line
        const lineLength = this.distance(x1, y1, x2, y2);
        if (lineLength === 0) return this.distance(px, py, x1, y1) <= tolerance;
        
        // Calculate the distance from point to line using the formula:
        // d = |cross product| / |line length|
        const crossProduct = Math.abs((py - y1) * (x2 - x1) - (px - x1) * (y2 - y1));
        const distance = crossProduct / lineLength;
        
        if (distance > tolerance) return false;
        
        // Check if the point is within the line segment bounds
        const dotProduct = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / Math.pow(lineLength, 2);
        return dotProduct >= 0 && dotProduct <= 1;
    },

    /**
     * Calculate the intersection point of two lines
     * @param {number} x1 - X coordinate of the first line start
     * @param {number} y1 - Y coordinate of the first line start
     * @param {number} x2 - X coordinate of the first line end
     * @param {number} y2 - Y coordinate of the first line end
     * @param {number} x3 - X coordinate of the second line start
     * @param {number} y3 - Y coordinate of the second line start
     * @param {number} x4 - X coordinate of the second line end
     * @param {number} y4 - Y coordinate of the second line end
     * @returns {Object|null} The intersection point {x, y} or null if no intersection
     */
    lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the denominator
        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        
        // Lines are parallel if denominator is zero
        if (denominator === 0) return null;
        
        // Calculate the parameters for the intersection point
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
        
        // Check if the intersection is within both line segments
        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: x1 + ua * (x2 - x1),
                y: y1 + ua * (y2 - y1)
            };
        }
        
        return null;
    },

    /**
     * Calculate the midpoint between two points
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {Object} The midpoint {x, y}
     */
    midpoint(x1, y1, x2, y2) {
        return {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        };
    },

    /**
     * Calculate a point at a specific distance and angle from another point
     * @param {number} x - X coordinate of the starting point
     * @param {number} y - Y coordinate of the starting point
     * @param {number} distance - The distance to the new point
     * @param {number} angle - The angle in radians
     * @returns {Object} The new point {x, y}
     */
    pointAtDistanceAndAngle(x, y, distance, angle) {
        return {
            x: x + distance * Math.cos(angle),
            y: y + distance * Math.sin(angle)
        };
    },

    /**
     * Snap a value to the nearest grid increment
     * @param {number} value - The value to snap
     * @param {number} gridSize - The grid size
     * @returns {number} The snapped value
     */
    snapToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    },

    /**
     * Snap a point to the nearest grid point
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @param {number} gridSize - The grid size
     * @returns {Object} The snapped point {x, y}
     */
    snapPointToGrid(x, y, gridSize) {
        return {
            x: this.snapToGrid(x, gridSize),
            y: this.snapToGrid(y, gridSize)
        };
    },

    /**
     * Check if two rectangles intersect
     * @param {number} x1 - X coordinate of the first rectangle's top-left corner
     * @param {number} y1 - Y coordinate of the first rectangle's top-left corner
     * @param {number} w1 - Width of the first rectangle
     * @param {number} h1 - Height of the first rectangle
     * @param {number} x2 - X coordinate of the second rectangle's top-left corner
     * @param {number} y2 - Y coordinate of the second rectangle's top-left corner
     * @param {number} w2 - Width of the second rectangle
     * @param {number} h2 - Height of the second rectangle
     * @returns {boolean} True if the rectangles intersect
     */
    rectanglesIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
    },

    /**
     * Check if a point is inside a rectangle
     * @param {number} px - X coordinate of the point
     * @param {number} py - Y coordinate of the point
     * @param {number} rx - X coordinate of the rectangle's top-left corner
     * @param {number} ry - Y coordinate of the rectangle's top-left corner
     * @param {number} rw - Width of the rectangle
     * @param {number} rh - Height of the rectangle
     * @returns {boolean} True if the point is inside the rectangle
     */
    isPointInRectangle(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    /**
     * Check if a point is inside a circle
     * @param {number} px - X coordinate of the point
     * @param {number} py - Y coordinate of the point
     * @param {number} cx - X coordinate of the circle's center
     * @param {number} cy - Y coordinate of the circle's center
     * @param {number} r - Radius of the circle
     * @returns {boolean} True if the point is inside the circle
     */
    isPointInCircle(px, py, cx, cy, r) {
        return this.distance(px, py, cx, cy) <= r;
    }
};

// Make MathUtils available globally
window.MathUtils = MathUtils; 