/**
 * Constraint Manager for the CAD Editor
 * Handles snapping and geometric constraints
 */
class ConstraintManager {
    /**
     * Create a new Constraint Manager
     */
    constructor() {
        this.initialized = false;
        this.snapToGrid = true;
        this.snapToPoints = true;
        this.snapToLines = true;
        this.snapDistance = 10; // Snap distance in pixels
        this.activeConstraints = {
            horizontal: false,
            vertical: false,
            parallel: false,
            perpendicular: false
        };
        this.referenceElement = null;
        this.referencePoint = null;
    }

    /**
     * Initialize the Constraint Manager
     * @param {CanvasManager} canvasManager - The Canvas Manager instance
     */
    init(canvasManager) {
        if (this.initialized) {
            logger.warn('Constraint Manager already initialized');
            return;
        }

        try {
            this.canvasManager = canvasManager;
            this.initialized = true;
            logger.info('Constraint Manager initialized successfully');
        } catch (error) {
            logger.error(`Failed to initialize Constraint Manager: ${error.message}`);
            throw error;
        }
    }

    /**
     * Set the reference element for constraints
     * @param {Object} element - The reference element
     */
    setReferenceElement(element) {
        this.referenceElement = element;
        logger.info(`Reference element set: ${element ? element.type + ' ' + element.id : 'none'}`);
    }

    /**
     * Set the reference point for constraints
     * @param {Point} point - The reference point
     */
    setReferencePoint(point) {
        this.referencePoint = point;
        logger.info(`Reference point set: ${point ? point.toString() : 'none'}`);
    }

    /**
     * Toggle a constraint
     * @param {string} constraint - The constraint to toggle (horizontal, vertical, parallel, perpendicular)
     * @param {boolean} enabled - Whether the constraint should be enabled
     */
    toggleConstraint(constraint, enabled) {
        if (this.activeConstraints.hasOwnProperty(constraint)) {
            this.activeConstraints[constraint] = enabled !== undefined ? enabled : !this.activeConstraints[constraint];
            logger.info(`Constraint ${constraint} ${this.activeConstraints[constraint] ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Apply constraints to a point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Constrained coordinates {x, y}
     */
    applyConstraints(x, y) {
        if (!this.initialized) return { x, y };
        
        let result = { x, y };
        
        // Apply grid snapping if enabled
        if (this.snapToGrid && this.canvasManager.snapEnabled) {
            result = this.canvasManager.snapToGrid(result.x, result.y);
        }
        
        // Apply point snapping if enabled
        if (this.snapToPoints) {
            const snappedToPoint = this.snapToNearestPoint(result.x, result.y);
            if (snappedToPoint) {
                result = snappedToPoint;
            }
        }
        
        // Apply line snapping if enabled
        if (this.snapToLines) {
            const snappedToLine = this.snapToNearestLine(result.x, result.y);
            if (snappedToLine) {
                result = snappedToLine;
            }
        }
        
        // Apply active constraints
        if (this.referencePoint) {
            if (this.activeConstraints.horizontal) {
                result.y = this.referencePoint.y;
            }
            
            if (this.activeConstraints.vertical) {
                result.x = this.referencePoint.x;
            }
        }
        
        return result;
    }

    /**
     * Snap to the nearest point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Snapped coordinates {x, y} or null if no snap
     */
    snapToNearestPoint(x, y) {
        if (!this.canvasManager) return null;
        
        const shapes = this.canvasManager.shapes;
        let closestPoint = null;
        let minDistance = this.snapDistance;
        
        // Convert snap distance from screen to world coordinates
        const worldSnapDistance = this.snapDistance / this.canvasManager.zoom;
        
        // Check all shapes for snap points
        for (const shape of shapes) {
            let snapPoints = [];
            
            if (shape.type === 'line') {
                // Line endpoints
                snapPoints.push({ x: shape.x1, y: shape.y1 });
                snapPoints.push({ x: shape.x2, y: shape.y2 });
                snapPoints.push({ x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 }); // Midpoint
            } else if (shape.type === 'rectangle') {
                // Rectangle corners
                snapPoints.push({ x: shape.x, y: shape.y }); // Top-left
                snapPoints.push({ x: shape.x + shape.width, y: shape.y }); // Top-right
                snapPoints.push({ x: shape.x, y: shape.y + shape.height }); // Bottom-left
                snapPoints.push({ x: shape.x + shape.width, y: shape.y + shape.height }); // Bottom-right
                snapPoints.push({ x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 }); // Center
            } else if (shape.type === 'circle') {
                // Circle center and cardinal points
                snapPoints.push({ x: shape.cx, y: shape.cy }); // Center
                snapPoints.push({ x: shape.cx + shape.radius, y: shape.cy }); // East
                snapPoints.push({ x: shape.cx, y: shape.cy + shape.radius }); // South
                snapPoints.push({ x: shape.cx - shape.radius, y: shape.cy }); // West
                snapPoints.push({ x: shape.cx, y: shape.cy - shape.radius }); // North
            } else if (shape.type === 'arc') {
                // Arc center, start, end, and midpoint
                snapPoints.push({ x: shape.cx, y: shape.cy }); // Center
                
                const startPoint = shape.getStartPoint();
                const endPoint = shape.getEndPoint();
                const midPoint = shape.pointAtPercentage(0.5);
                
                snapPoints.push({ x: startPoint.x, y: startPoint.y }); // Start
                snapPoints.push({ x: endPoint.x, y: endPoint.y }); // End
                snapPoints.push({ x: midPoint.x, y: midPoint.y }); // Midpoint
            }
            
            // Find the closest snap point
            for (const point of snapPoints) {
                const distance = MathUtils.distance(x, y, point.x, point.y);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            }
        }
        
        return closestPoint;
    }

    /**
     * Snap to the nearest line
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} Snapped coordinates {x, y} or null if no snap
     */
    snapToNearestLine(x, y) {
        if (!this.canvasManager) return null;
        
        const shapes = this.canvasManager.shapes;
        let closestPoint = null;
        let minDistance = this.snapDistance;
        
        // Convert snap distance from screen to world coordinates
        const worldSnapDistance = this.snapDistance / this.canvasManager.zoom;
        
        // Check all shapes for snap lines
        for (const shape of shapes) {
            if (shape.type === 'line') {
                // Project point onto line
                const projectedPoint = this.projectPointOnLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
                
                if (projectedPoint) {
                    const distance = MathUtils.distance(x, y, projectedPoint.x, projectedPoint.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = projectedPoint;
                    }
                }
            } else if (shape.type === 'rectangle') {
                // Check each edge of the rectangle
                const edges = [
                    { x1: shape.x, y1: shape.y, x2: shape.x + shape.width, y2: shape.y }, // Top
                    { x1: shape.x + shape.width, y1: shape.y, x2: shape.x + shape.width, y2: shape.y + shape.height }, // Right
                    { x1: shape.x, y1: shape.y + shape.height, x2: shape.x + shape.width, y2: shape.y + shape.height }, // Bottom
                    { x1: shape.x, y1: shape.y, x2: shape.x, y2: shape.y + shape.height } // Left
                ];
                
                for (const edge of edges) {
                    const projectedPoint = this.projectPointOnLine(x, y, edge.x1, edge.y1, edge.x2, edge.y2);
                    
                    if (projectedPoint) {
                        const distance = MathUtils.distance(x, y, projectedPoint.x, projectedPoint.y);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestPoint = projectedPoint;
                        }
                    }
                }
            } else if (shape.type === 'circle' || shape.type === 'arc') {
                // Snap to the circle/arc at the angle from center to point
                const angle = MathUtils.angle(shape.cx, shape.cy, x, y);
                
                if (shape.type === 'circle' || 
                    (shape.type === 'arc' && Arc.isAngleBetween(angle, shape.startAngle, shape.endAngle))) {
                    const snapPoint = {
                        x: shape.cx + shape.radius * Math.cos(angle),
                        y: shape.cy + shape.radius * Math.sin(angle)
                    };
                    
                    const distance = MathUtils.distance(x, y, snapPoint.x, snapPoint.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = snapPoint;
                    }
                }
            }
        }
        
        return closestPoint;
    }

    /**
     * Project a point onto a line
     * @param {number} px - X coordinate of the point
     * @param {number} py - Y coordinate of the point
     * @param {number} x1 - X coordinate of the line start
     * @param {number} y1 - Y coordinate of the line start
     * @param {number} x2 - X coordinate of the line end
     * @param {number} y2 - Y coordinate of the line end
     * @returns {Object|null} Projected point {x, y} or null if projection is outside the line segment
     */
    projectPointOnLine(px, py, x1, y1, x2, y2) {
        const lineLength = MathUtils.distance(x1, y1, x2, y2);
        
        if (lineLength === 0) return null;
        
        // Calculate the projection parameter
        const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);
        
        // Check if the projection is on the line segment
        if (t < 0 || t > 1) return null;
        
        // Calculate the projected point
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }

    /**
     * Apply parallel constraint
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {Object} Constrained coordinates for the second point {x, y}
     */
    applyParallelConstraint(x1, y1, x2, y2) {
        if (!this.activeConstraints.parallel || !this.referenceElement || this.referenceElement.type !== 'line') {
            return { x: x2, y: y2 };
        }
        
        const refLine = this.referenceElement;
        const refAngle = Math.atan2(refLine.y2 - refLine.y1, refLine.x2 - refLine.x1);
        const distance = MathUtils.distance(x1, y1, x2, y2);
        const currentAngle = Math.atan2(y2 - y1, x2 - x1);
        
        // Calculate the angle difference and adjust
        const angleDiff = refAngle - currentAngle;
        const newAngle = currentAngle + angleDiff;
        
        // Calculate the new point
        return {
            x: x1 + distance * Math.cos(newAngle),
            y: y1 + distance * Math.sin(newAngle)
        };
    }

    /**
     * Apply perpendicular constraint
     * @param {number} x1 - X coordinate of the first point
     * @param {number} y1 - Y coordinate of the first point
     * @param {number} x2 - X coordinate of the second point
     * @param {number} y2 - Y coordinate of the second point
     * @returns {Object} Constrained coordinates for the second point {x, y}
     */
    applyPerpendicularConstraint(x1, y1, x2, y2) {
        if (!this.activeConstraints.perpendicular || !this.referenceElement || this.referenceElement.type !== 'line') {
            return { x: x2, y: y2 };
        }
        
        const refLine = this.referenceElement;
        const refAngle = Math.atan2(refLine.y2 - refLine.y1, refLine.x2 - refLine.x1);
        const perpAngle = refAngle + Math.PI / 2; // Add 90 degrees
        const distance = MathUtils.distance(x1, y1, x2, y2);
        
        // Calculate the new point
        return {
            x: x1 + distance * Math.cos(perpAngle),
            y: y1 + distance * Math.sin(perpAngle)
        };
    }
}

// Create a singleton instance
const constraintManager = new ConstraintManager();

// Make constraintManager available globally
window.constraintManager = constraintManager; 