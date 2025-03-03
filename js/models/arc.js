/**
 * Arc class for the CAD Editor
 * Represents an arc defined by its center point, radius, start angle, and end angle
 */
class Arc {
    /**
     * Create a new Arc
     * @param {number} cx - X coordinate of the center
     * @param {number} cy - Y coordinate of the center
     * @param {number} radius - Radius of the arc
     * @param {number} startAngle - Start angle in radians
     * @param {number} endAngle - End angle in radians
     */
    constructor(cx, cy, radius, startAngle, endAngle) {
        this.cx = cx || 0;
        this.cy = cy || 0;
        this.radius = radius || 0;
        this.startAngle = startAngle || 0;
        this.endAngle = endAngle || 0;
        this.type = 'arc';
        this.id = `arc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create an Arc from a center Point, radius, and angles
     * @param {Point} center - The center point
     * @param {number} radius - The radius
     * @param {number} startAngle - Start angle in radians
     * @param {number} endAngle - End angle in radians
     * @returns {Arc} A new Arc instance
     */
    static fromCenterRadiusAndAngles(center, radius, startAngle, endAngle) {
        return new Arc(center.x, center.y, radius, startAngle, endAngle);
    }

    /**
     * Create an Arc from a center Point and two points on the arc
     * @param {Point} center - The center point
     * @param {Point} startPoint - The start point on the arc
     * @param {Point} endPoint - The end point on the arc
     * @returns {Arc} A new Arc instance
     */
    static fromCenterAndPoints(center, startPoint, endPoint) {
        const radius = center.distanceTo(startPoint);
        const startAngle = MathUtils.angle(center.x, center.y, startPoint.x, startPoint.y);
        const endAngle = MathUtils.angle(center.x, center.y, endPoint.x, endPoint.y);
        
        return new Arc(center.x, center.y, radius, startAngle, endAngle);
    }

    /**
     * Create an Arc from three points on the arc
     * @param {Point} p1 - First point on the arc
     * @param {Point} p2 - Second point on the arc
     * @param {Point} p3 - Third point on the arc
     * @returns {Arc|null} A new Arc instance or null if the points are collinear
     */
    static fromThreePoints(p1, p2, p3) {
        // Check if points are collinear
        const area = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);
        if (Math.abs(area) < 0.001) return null; // Points are collinear
        
        // Calculate the perpendicular bisectors of p1p2 and p2p3
        const mid1 = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        const mid2 = new Point((p2.x + p3.x) / 2, (p2.y + p3.y) / 2);
        
        // Calculate the slopes of the lines p1p2 and p2p3
        const slope1 = (p2.y - p1.y) / (p2.x - p1.x);
        const slope2 = (p3.y - p2.y) / (p3.x - p2.x);
        
        // Calculate the slopes of the perpendicular bisectors
        let perpSlope1, perpSlope2;
        
        if (Math.abs(slope1) < 0.001) {
            perpSlope1 = Infinity;
        } else if (!isFinite(slope1)) {
            perpSlope1 = 0;
        } else {
            perpSlope1 = -1 / slope1;
        }
        
        if (Math.abs(slope2) < 0.001) {
            perpSlope2 = Infinity;
        } else if (!isFinite(slope2)) {
            perpSlope2 = 0;
        } else {
            perpSlope2 = -1 / slope2;
        }
        
        // Calculate the center point (intersection of perpendicular bisectors)
        let center;
        
        if (!isFinite(perpSlope1)) {
            // First bisector is vertical
            const x = mid1.x;
            const y = perpSlope2 * (x - mid2.x) + mid2.y;
            center = new Point(x, y);
        } else if (!isFinite(perpSlope2)) {
            // Second bisector is vertical
            const x = mid2.x;
            const y = perpSlope1 * (x - mid1.x) + mid1.y;
            center = new Point(x, y);
        } else {
            // Neither bisector is vertical
            const x = (mid2.y - mid1.y + perpSlope1 * mid1.x - perpSlope2 * mid2.x) / (perpSlope1 - perpSlope2);
            const y = perpSlope1 * (x - mid1.x) + mid1.y;
            center = new Point(x, y);
        }
        
        // Calculate radius
        const radius = center.distanceTo(p1);
        
        // Calculate angles
        const startAngle = MathUtils.angle(center.x, center.y, p1.x, p1.y);
        const midAngle = MathUtils.angle(center.x, center.y, p2.x, p2.y);
        const endAngle = MathUtils.angle(center.x, center.y, p3.x, p3.y);
        
        // Determine the correct start and end angles based on the order of points
        let finalStartAngle, finalEndAngle;
        
        // Check if the arc goes clockwise or counterclockwise
        if (Arc.isAngleBetween(midAngle, startAngle, endAngle)) {
            finalStartAngle = startAngle;
            finalEndAngle = endAngle;
        } else {
            finalStartAngle = endAngle;
            finalEndAngle = startAngle;
        }
        
        return new Arc(center.x, center.y, radius, finalStartAngle, finalEndAngle);
    }

    /**
     * Create an Arc from an object with cx, cy, radius, startAngle, endAngle properties
     * @param {Object} obj - The object with arc properties
     * @returns {Arc} A new Arc instance
     */
    static fromObject(obj) {
        return new Arc(obj.cx, obj.cy, obj.radius, obj.startAngle, obj.endAngle);
    }

    /**
     * Check if an angle is between two other angles (going counterclockwise)
     * @param {number} angle - The angle to check
     * @param {number} start - The start angle
     * @param {number} end - The end angle
     * @returns {boolean} True if the angle is between start and end
     */
    static isAngleBetween(angle, start, end) {
        // Normalize angles to [0, 2π)
        const normalizedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const normalizedStart = (start % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const normalizedEnd = (end % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        
        if (normalizedStart <= normalizedEnd) {
            return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
        } else {
            return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
        }
    }

    /**
     * Get the center point of this Arc
     * @returns {Point} The center point
     */
    getCenter() {
        return new Point(this.cx, this.cy);
    }

    /**
     * Get the start point of this Arc
     * @returns {Point} The start point
     */
    getStartPoint() {
        return new Point(
            this.cx + this.radius * Math.cos(this.startAngle),
            this.cy + this.radius * Math.sin(this.startAngle)
        );
    }

    /**
     * Get the end point of this Arc
     * @returns {Point} The end point
     */
    getEndPoint() {
        return new Point(
            this.cx + this.radius * Math.cos(this.endAngle),
            this.cy + this.radius * Math.sin(this.endAngle)
        );
    }

    /**
     * Get the angle span of this Arc in radians
     * @returns {number} The angle span in radians
     */
    getAngleSpan() {
        let span = this.endAngle - this.startAngle;
        
        // Ensure positive span
        if (span < 0) {
            span += 2 * Math.PI;
        }
        
        return span;
    }

    /**
     * Get the angle span of this Arc in degrees
     * @returns {number} The angle span in degrees
     */
    getAngleSpanDegrees() {
        return MathUtils.radiansToDegrees(this.getAngleSpan());
    }

    /**
     * Get the length of this Arc
     * @returns {number} The length
     */
    getLength() {
        return this.radius * this.getAngleSpan();
    }

    /**
     * Get the area of the sector formed by this Arc
     * @returns {number} The area
     */
    getSectorArea() {
        return 0.5 * this.radius * this.radius * this.getAngleSpan();
    }

    /**
     * Check if a point is on this Arc
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @param {number} tolerance - Distance tolerance
     * @returns {boolean} True if the point is on the arc
     */
    isPointOnArc(x, y, tolerance = 5) {
        // Check if the point is on the circle
        const distance = MathUtils.distance(x, y, this.cx, this.cy);
        if (Math.abs(distance - this.radius) > tolerance) return false;
        
        // Check if the point's angle is within the arc's angle span
        const angle = MathUtils.angle(this.cx, this.cy, x, y);
        return Arc.isAngleBetween(angle, this.startAngle, this.endAngle);
    }

    /**
     * Calculate a point on this Arc at a given angle
     * @param {number} angle - The angle in radians
     * @returns {Point|null} The point on the arc or null if the angle is outside the arc's span
     */
    pointAtAngle(angle) {
        if (!Arc.isAngleBetween(angle, this.startAngle, this.endAngle)) return null;
        
        return new Point(
            this.cx + this.radius * Math.cos(angle),
            this.cy + this.radius * Math.sin(angle)
        );
    }

    /**
     * Calculate a point on this Arc at a given percentage of its length
     * @param {number} percentage - The percentage (0 to 1)
     * @returns {Point} The point on the arc
     */
    pointAtPercentage(percentage) {
        const angle = this.startAngle + percentage * this.getAngleSpan();
        
        return new Point(
            this.cx + this.radius * Math.cos(angle),
            this.cy + this.radius * Math.sin(angle)
        );
    }

    /**
     * Get the bounding box of this Arc
     * @returns {Object} The bounding box {x, y, width, height}
     */
    getBoundingBox() {
        // Find the extreme points of the arc
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        // Check start and end points
        const startPoint = this.getStartPoint();
        const endPoint = this.getEndPoint();
        
        minX = Math.min(minX, startPoint.x, endPoint.x);
        minY = Math.min(minY, startPoint.y, endPoint.y);
        maxX = Math.max(maxX, startPoint.x, endPoint.x);
        maxY = Math.max(maxY, startPoint.y, endPoint.y);
        
        // Check if the arc crosses the x or y axes
        const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
        
        for (const angle of angles) {
            if (Arc.isAngleBetween(angle, this.startAngle, this.endAngle)) {
                const point = new Point(
                    this.cx + this.radius * Math.cos(angle),
                    this.cy + this.radius * Math.sin(angle)
                );
                
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
        }
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Create a copy of this Arc
     * @returns {Arc} A new Arc with the same properties
     */
    clone() {
        return new Arc(this.cx, this.cy, this.radius, this.startAngle, this.endAngle);
    }

    /**
     * Check if this Arc is equal to another Arc
     * @param {Arc} arc - The Arc to compare with
     * @param {number} tolerance - The tolerance for equality
     * @returns {boolean} True if the arcs are equal within the tolerance
     */
    equals(arc, tolerance = 0.001) {
        if (!arc) return false;
        
        return (
            Math.abs(this.cx - arc.cx) <= tolerance &&
            Math.abs(this.cy - arc.cy) <= tolerance &&
            Math.abs(this.radius - arc.radius) <= tolerance &&
            Math.abs(this.startAngle - arc.startAngle) <= tolerance &&
            Math.abs(this.endAngle - arc.endAngle) <= tolerance
        );
    }

    /**
     * Move this Arc by a specified offset
     * @param {number} dx - The x offset
     * @param {number} dy - The y offset
     */
    move(dx, dy) {
        this.cx += dx;
        this.cy += dy;
    }

    /**
     * Resize this Arc
     * @param {number} newRadius - The new radius
     */
    resize(newRadius) {
        this.radius = Math.max(0, newRadius);
    }

    /**
     * Snap this Arc to the grid
     * @param {number} gridSize - The grid size
     */
    snapToGrid(gridSize) {
        const snappedCenter = MathUtils.snapPointToGrid(this.cx, this.cy, gridSize);
        this.cx = snappedCenter.x;
        this.cy = snappedCenter.y;
        
        // Optionally snap radius to grid increments
        this.radius = MathUtils.snapToGrid(this.radius, gridSize);
    }

    /**
     * Generate the SVG path data for this Arc
     * @returns {string} The SVG path data
     */
    toSVGPathData() {
        const startPoint = this.getStartPoint();
        const endPoint = this.getEndPoint();
        const largeArcFlag = this.getAngleSpan() > Math.PI ? 1 : 0;
        
        // SVG arc path
        return `M ${startPoint.x} ${startPoint.y} ` +
               `A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
    }

    /**
     * Generate an SVG element for this Arc
     * @returns {SVGElement} The SVG path element
     */
    toSVGElement() {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.toSVGPathData());
        path.setAttribute('data-id', this.id);
        path.setAttribute('data-type', this.type);
        return path;
    }

    /**
     * Convert this Arc to a string representation
     * @returns {string} The string representation of this Arc
     */
    toString() {
        return `Arc at (${MathUtils.round(this.cx, 2)}, ${MathUtils.round(this.cy, 2)}) ` +
               `with radius ${MathUtils.round(this.radius, 2)}, ` +
               `from ${MathUtils.round(MathUtils.radiansToDegrees(this.startAngle), 2)}° ` +
               `to ${MathUtils.round(MathUtils.radiansToDegrees(this.endAngle), 2)}°`;
    }

    /**
     * Convert this Arc to an object
     * @returns {Object} The object representation of this Arc
     */
    toObject() {
        return {
            type: this.type,
            id: this.id,
            cx: this.cx,
            cy: this.cy,
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        };
    }
}

// Make Arc available globally
window.Arc = Arc; 