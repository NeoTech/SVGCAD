/**
 * Circle Tool for the CAD Editor
 * Allows drawing circles by center and radius
 */
class CircleTool extends BaseTool {
    /**
     * Create a new CircleTool
     */
    constructor() {
        super('circle');
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
        this.drawMode = 'center-radius'; // 'center-radius' or 'diameter'
    }

    /**
     * Activate the tool
     */
    activate() {
        super.activate();
        this.updateStatusHint();
    }

    /**
     * Deactivate the tool
     */
    deactivate() {
        super.deactivate();
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = 'Circle: Click and drag to create a circle';
        
        if (this.appState) {
            this.appState.statusHint = this.statusHint;
        }
    }

    /**
     * Set the draw mode
     * @param {string} mode - The draw mode ('center-radius' or 'diameter')
     */
    setDrawMode(mode) {
        if (mode === 'center-radius' || mode === 'diameter') {
            this.drawMode = mode;
            logger.info(`Circle tool: Draw mode set to ${mode}`);
        } else {
            logger.warn(`Circle tool: Invalid draw mode ${mode}`);
        }
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseDown(event) {
        if (!this.active || !this.canvasManager) return;
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        // Set center point
        this.centerPoint = new Point(constrainedPos.x, constrainedPos.y);
        this.mouseDown = true;
        
        // Create a preview circle with zero radius
        this.previewCircle = new Circle(
            this.centerPoint.x,
            this.centerPoint.y,
            0
        );
        
        this.canvasManager.setPreviewElement(this.previewCircle);
        
        logger.info(`Circle tool: Center point set at ${this.centerPoint.toString()}`);
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseMove(event) {
        if (!this.active || !this.canvasManager) return;
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        this.currentPoint = new Point(constrainedPos.x, constrainedPos.y);
        
        // Update mouse position in app state
        if (this.appState) {
            this.appState.mousePosition = { 
                x: this.currentPoint.x, 
                y: this.currentPoint.y 
            };
        }
        
        // Update preview circle if we're drawing
        if (this.mouseDown && this.previewCircle && this.centerPoint) {
            this.updatePreviewCircle();
        }
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseUp(event) {
        if (!this.active || !this.mouseDown || !this.canvasManager) return;
        
        this.mouseDown = false;
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        this.radiusPoint = new Point(constrainedPos.x, constrainedPos.y);
        
        // Store the radius point for logging before reset
        const radiusPointStr = this.radiusPoint.toString();
        
        // Create the circle
        this.createCircle();
        
        // Reset for next circle
        this.reset();
        
        logger.info(`Circle tool: Radius point set at ${radiusPointStr}`);
        this.updateStatusHint();
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyDown(event) {
        if (!this.active) return;
        
        // Handle escape key to cancel
        if (event.key === 'Escape') {
            this.cancel();
            event.preventDefault();
            return;
        }
        
        // Handle shift key for perfect circle from center
        if (event.key === 'Shift' && this.mouseDown) {
            // Update preview with perfect circle constraint
            this.updatePreviewCircle(true);
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyUp(event) {
        if (!this.active) return;
        
        // Handle shift key release
        if (event.key === 'Shift' && this.mouseDown) {
            // Update preview without perfect circle constraint
            this.updatePreviewCircle(false);
        }
    }

    /**
     * Cancel the current operation
     */
    cancel() {
        super.cancel();
        this.updateStatusHint();
    }

    /**
     * Update the preview circle
     * @param {boolean} perfectCircle - Whether to enforce a perfect circle
     */
    updatePreviewCircle(perfectCircle = false) {
        if (!this.centerPoint || !this.currentPoint || !this.previewCircle) return;
        
        // Calculate radius based on distance from center to current point
        let radius = this.centerPoint.distanceTo(this.currentPoint);
        
        // Update preview circle
        this.previewCircle.centerX = this.centerPoint.x;
        this.previewCircle.centerY = this.centerPoint.y;
        this.previewCircle.radius = radius;
        
        this.canvasManager.setPreviewElement(this.previewCircle);
    }

    /**
     * Create a circle
     */
    createCircle() {
        if (!this.canvasManager || !this.centerPoint || !this.radiusPoint) return;
        
        // Calculate radius
        const radius = this.centerPoint.distanceTo(this.radiusPoint);
        
        // Check if the circle has zero radius
        if (radius < 0.001) {
            logger.warn('Circle tool: Cannot create zero-radius circle');
            return;
        }
        
        // Create the circle
        const circle = new Circle(
            this.centerPoint.x,
            this.centerPoint.y,
            radius
        );
        
        // Add the circle to the canvas
        this.canvasManager.addShape(circle);
        
        logger.info(`Circle created at (${this.centerPoint.x}, ${this.centerPoint.y}) with radius ${radius}`);
    }
}

// Create a singleton instance
const circleTool = new CircleTool();

// Make circleTool available globally
window.circleTool = circleTool; 