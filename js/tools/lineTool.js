/**
 * Line Tool for the CAD Editor
 * Allows drawing lines
 */
class LineTool extends BaseTool {
    /**
     * Create a new LineTool
     */
    constructor() {
        super('line');
        this.previewLine = null;
        this.continuousMode = false;
        this.lastEndPoint = null;
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
        this.previewLine = null;
        this.continuousMode = false;
        this.lastEndPoint = null;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewLine = null;
        this.continuousMode = false;
        this.lastEndPoint = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        if (this.continuousMode) {
            this.statusHint = 'Line: Click to set next point, double-click to end continuous mode';
        } else {
            this.statusHint = 'Line: Click and drag to create a line, hold Shift for continuous mode';
        }
        
        if (this.appState) {
            this.appState.statusHint = this.statusHint;
        }
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseDown(event) {
        if (!this.active || !this.canvasManager) return;
        
        // If we're in continuous mode, we're setting the end point of the current line
        // and the start point of the next line
        if (this.continuousMode) {
            // Get mouse position in world coordinates
            const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
            const screenX = event.clientX - rect.left;
            const screenY = event.clientY - rect.top;
            const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
            
            // Apply constraints
            const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
            
            this.currentPoint = new Point(constrainedPos.x, constrainedPos.y);
            
            // Create the line
            this.createLine(this.lastEndPoint, this.currentPoint);
            
            // Set the start point for the next line
            this.startPoint = this.currentPoint.clone();
            this.lastEndPoint = this.startPoint.clone();
            
            // Create a preview line for the next segment
            this.previewLine = new Line(
                this.startPoint.x,
                this.startPoint.y,
                this.startPoint.x,
                this.startPoint.y
            );
            
            this.canvasManager.setPreviewElement(this.previewLine);
            
            return;
        }
        
        // Normal mode - setting the start point
        this.mouseDown = true;
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        this.startPoint = new Point(constrainedPos.x, constrainedPos.y);
        this.currentPoint = this.startPoint.clone();
        
        // Create a preview line
        this.previewLine = new Line(
            this.startPoint.x,
            this.startPoint.y,
            this.startPoint.x,
            this.startPoint.y
        );
        
        this.canvasManager.setPreviewElement(this.previewLine);
        
        this.updateStatusHint();
        
        logger.info(`Line tool: Start point set at ${this.startPoint.toString()}`);
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
        
        // Update preview line if we're drawing
        if ((this.mouseDown || this.continuousMode) && this.previewLine) {
            this.previewLine.x2 = this.currentPoint.x;
            this.previewLine.y2 = this.currentPoint.y;
            
            this.canvasManager.setPreviewElement(this.previewLine);
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
        
        this.currentPoint = new Point(constrainedPos.x, constrainedPos.y);
        
        // Store the current point for logging before potential reset
        const currentPointStr = this.currentPoint.toString();
        
        // Check if the line has zero length
        if (this.startPoint.equals(this.currentPoint)) {
            logger.warn('Line tool: Cannot create zero-length line');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Create the line
        this.createLine(this.startPoint, this.currentPoint);
        
        // Enter continuous mode if shift key is pressed
        if (event.shiftKey) {
            this.continuousMode = true;
            this.lastEndPoint = this.currentPoint.clone();
            this.startPoint = this.lastEndPoint.clone();
            
            // Create a preview line for the next segment
            this.previewLine = new Line(
                this.startPoint.x,
                this.startPoint.y,
                this.startPoint.x,
                this.startPoint.y
            );
            
            this.canvasManager.setPreviewElement(this.previewLine);
        } else {
            // Reset for next line
            this.reset();
        }
        
        this.updateStatusHint();
        
        logger.info(`Line tool: End point set at ${currentPointStr}`);
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
        
        // Handle shift key for horizontal/vertical constraint
        if (event.key === 'Shift' && this.startPoint && this.currentPoint) {
            // Apply horizontal/vertical constraint
            const dx = Math.abs(this.currentPoint.x - this.startPoint.x);
            const dy = Math.abs(this.currentPoint.y - this.startPoint.y);
            
            if (dx > dy) {
                // Horizontal constraint
                this.currentPoint.y = this.startPoint.y;
            } else {
                // Vertical constraint
                this.currentPoint.x = this.startPoint.x;
            }
            
            // Update preview
            if (this.previewLine) {
                this.previewLine.x2 = this.currentPoint.x;
                this.previewLine.y2 = this.currentPoint.y;
                
                this.canvasManager.setPreviewElement(this.previewLine);
            }
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyUp(event) {
        if (!this.active) return;
        
        // Handle shift key release
        if (event.key === 'Shift' && this.startPoint && this.currentPoint) {
            // Remove constraint
            // (The next mouse move will update the preview)
        }
    }

    /**
     * Handle double click event
     * @param {MouseEvent} event - The mouse event
     */
    onDoubleClick(event) {
        if (!this.active) return;
        
        // End continuous mode on double click
        if (this.continuousMode) {
            this.continuousMode = false;
            this.reset();
            this.updateStatusHint();
            
            logger.info('Line tool: Continuous mode ended');
        }
    }

    /**
     * Create a line from start to end points
     * @param {Point} startPoint - The start point
     * @param {Point} endPoint - The end point
     */
    createLine(startPoint, endPoint) {
        if (!this.canvasManager) return;
        
        // Check if the line has zero length
        if (startPoint.equals(endPoint)) {
            logger.warn('Line tool: Cannot create zero-length line');
            return;
        }
        
        // Create the line
        const line = new Line(
            startPoint.x,
            startPoint.y,
            endPoint.x,
            endPoint.y
        );
        
        // Add the line to the canvas
        this.canvasManager.addShape(line);
        
        logger.info(`Line created from ${startPoint.toString()} to ${endPoint.toString()}`);
    }
}

// Create a singleton instance
const lineTool = new LineTool();

// Make lineTool available globally
window.lineTool = lineTool; 