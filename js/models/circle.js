/**
 * Circle class for the CAD Editor
 * Represents a circle defined by its center point and radius
 */
class Circle {
    /**
     * Create a new Circle
     * @param {number} cx - X coordinate of the center
     * @param {number} cy - Y coordinate of the center
     * @param {number} radius - Radius of the circle
     */
    constructor(cx, cy, radius) {
        this.cx = cx || 0;
        this.cy = cy || 0;
        this.radius = radius || 0;
        this.type = 'circle';
        this.id = `circle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Create a Circle from a center Point and radius
     * @param {Point} center - The center point
     * @param {number} radius - The radius
     * @returns {Circle} A new Circle instance
     */
    static fromCenterAndRadius(center, radius) {
        return new Circle(center.x, center.y, radius);
    }

    /**
     * Create a Circle from a center Point and a point on the circumference
     * @param {Point} center - The center point
     * @param {Point} pointOnCircumference - A point on the circumference
     * @returns {Circle} A new Circle instance
     */
    static fromCenterAndPoint(center, pointOnCircumference) {
        const radius = center.distanceTo(pointOnCircumference);
        return new Circle(center.x, center.y, radius);
    }

    /**
     * Create a Circle from an object with cx, cy, radius properties
     * @param {Object} obj - The object with circle properties
     * @returns {Circle} A new Circle instance
     */
    static fromObject(obj) {
        return new Circle(obj.cx, obj.cy, obj.radius);
    }

    /**
     * Get the center point of this Circle
     * @returns {Point} The center point
     */
    getCenter() {
        return new Point(this.cx, this.cy);
    }

    /**
     * Get the area of this Circle
     * @returns {number} The area
     */
    getArea() {
        return Math.PI * this.radius * this.radius;
    }

    /**
     * Get the circumference of this Circle
     * @returns {number} The circumference
     */
    getCircumference() {
        return 2 * Math.PI * this.radius;
    }

    /**
     * Get the bounding box of this Circle
     * @returns {Object} The bounding box {x, y, width, height}
     */
    getBoundingBox() {
        return {
            x: this.cx - this.radius,
            y: this.cy - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    /**
     * Check if a point is inside this Circle
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @returns {boolean} True if the point is inside the circle
     */
    containsPoint(x, y) {
        return MathUtils.isPointInCircle(x, y, this.cx, this.cy, this.radius);
    }

    /**
     * Check if a point is on the circumference of this Circle
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @param {number} tolerance - Distance tolerance
     * @returns {boolean} True if the point is on the circumference
     */
    isPointOnCircumference(x, y, tolerance = 5) {
        const distance = MathUtils.distance(x, y, this.cx, this.cy);
        return Math.abs(distance - this.radius) <= tolerance;
    }

    /**
     * Calculate a point on the circumference at a given angle
     * @param {number} angle - The angle in radians
     * @returns {Point} The point on the circumference
     */
    pointAtAngle(angle) {
        return new Point(
            this.cx + this.radius * Math.cos(angle),
            this.cy + this.radius * Math.sin(angle)
        );
    }

    /**
     * Calculate the angle of a point on the circumference
     * @param {Point} point - The point on the circumference
     * @returns {number} The angle in radians
     */
    angleOfPoint(point) {
        return MathUtils.angle(this.cx, this.cy, point.x, point.y);
    }

    /**
     * Check if this Circle intersects with a Line
     * @param {Line} line - The Line
     * @returns {Array<Point>} Array of intersection points (0, 1, or 2 points)
     */
    intersectWithLine(line) {
        // Convert line to parametric form: P = P1 + t(P2 - P1)
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        
        // Solve quadratic equation for intersection
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (line.x1 - this.cx) + dy * (line.y1 - this.cy));
        const c = (line.x1 - this.cx) * (line.x1 - this.cx) + 
                  (line.y1 - this.cy) * (line.y1 - this.cy) - 
                  this.radius * this.radius;
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            // No intersection
            return [];
        }
        
        if (discriminant === 0) {
            // One intersection (tangent)
            const t = -b / (2 * a);
            if (t < 0 || t > 1) return []; // Intersection outside line segment
            
            return [
                new Point(
                    line.x1 + t * dx,
                    line.y1 + t * dy
                )
            ];
        }
        
        // Two intersections
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        const intersections = [];
        
        if (t1 >= 0 && t1 <= 1) {
            intersections.push(
                new Point(
                    line.x1 + t1 * dx,
                    line.y1 + t1 * dy
                )
            );
        }
        
        if (t2 >= 0 && t2 <= 1) {
            intersections.push(
                new Point(
                    line.x1 + t2 * dx,
                    line.y1 + t2 * dy
                )
            );
        }
        
        return intersections;
    }

    /**
     * Check if this Circle intersects with another Circle
     * @param {Circle} circle - The other Circle
     * @returns {boolean} True if the circles intersect
     */
    intersectsWithCircle(circle) {
        const distance = MathUtils.distance(this.cx, this.cy, circle.cx, circle.cy);
        return distance < this.radius + circle.radius;
    }

    /**
     * Create a copy of this Circle
     * @returns {Circle} A new Circle with the same properties
     */
    clone() {
        return new Circle(this.cx, this.cy, this.radius);
    }

    /**
     * Check if this Circle is equal to another Circle
     * @param {Circle} circle - The Circle to compare with
     * @param {number} tolerance - The tolerance for equality
     * @returns {boolean} True if the circles are equal within the tolerance
     */
    equals(circle, tolerance = 0.001) {
        if (!circle) return false;
        
        return (
            Math.abs(this.cx - circle.cx) <= tolerance &&
            Math.abs(this.cy - circle.cy) <= tolerance &&
            Math.abs(this.radius - circle.radius) <= tolerance
        );
    }

    /**
     * Move this Circle by a specified offset
     * @param {number} dx - The x offset
     * @param {number} dy - The y offset
     */
    move(dx, dy) {
        this.cx += dx;
        this.cy += dy;
    }

    /**
     * Resize this Circle
     * @param {number} newRadius - The new radius
     */
    resize(newRadius) {
        this.radius = Math.max(0, newRadius);
    }

    /**
     * Snap this Circle to the grid
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
     * Generate the SVG path data for this Circle
     * @returns {string} The SVG path data
     */
    toSVGPathData() {
        // SVG circle path using arc commands
        return `M ${this.cx - this.radius} ${this.cy} ` +
               `A ${this.radius} ${this.radius} 0 1 0 ${this.cx + this.radius} ${this.cy} ` +
               `A ${this.radius} ${this.radius} 0 1 0 ${this.cx - this.radius} ${this.cy}`;
    }

    /**
     * Generate an SVG element for this Circle
     * @returns {SVGElement} The SVG circle element
     */
    toSVGElement() {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', this.cx);
        circle.setAttribute('cy', this.cy);
        circle.setAttribute('r', this.radius);
        circle.setAttribute('data-id', this.id);
        circle.setAttribute('data-type', this.type);
        return circle;
    }

    /**
     * Convert this Circle to a string representation
     * @returns {string} The string representation of this Circle
     */
    toString() {
        return `Circle at (${MathUtils.round(this.cx, 2)}, ${MathUtils.round(this.cy, 2)}) with radius ${MathUtils.round(this.radius, 2)}`;
    }

    /**
     * Convert this Circle to an object
     * @returns {Object} The object representation of this Circle
     */
    toObject() {
        return {
            type: this.type,
            id: this.id,
            cx: this.cx,
            cy: this.cy,
            radius: this.radius
        };
    }
}

// Make Circle available globally
window.Circle = Circle; 