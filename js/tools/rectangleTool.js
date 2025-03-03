/**
 * Rectangle Tool for the CAD Editor
 * Allows drawing rectangles
 */
class RectangleTool extends BaseTool {
    /**
     * Create a new RectangleTool
     */
    constructor() {
        super('rectangle');
        this.previewRect = null;
        this.squareMode = false;
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
        this.previewRect = null;
        this.squareMode = false;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewRect = null;
        this.squareMode = false;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = 'Rectangle: Click and drag to create a rectangle, hold Shift for square';
        
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
        
        // Check if shift key is pressed for square mode
        this.squareMode = event.shiftKey;
        
        // Create a preview rectangle
        this.previewRect = new Rectangle(
            this.startPoint.x,
            this.startPoint.y,
            0,
            0
        );
        
        this.canvasManager.setPreviewElement(this.previewRect);
        
        this.updateStatusHint();
        
        logger.info(`Rectangle tool: First corner set at ${this.startPoint.toString()}`);
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
        
        // Update preview rectangle if we're drawing
        if (this.mouseDown && this.previewRect) {
            // Check if shift key is pressed for square mode
            this.squareMode = event.shiftKey;
            
            this.updatePreviewRectangle();
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
        
        // Store the current point for logging before reset
        const currentPointStr = this.currentPoint.toString();
        
        // Check if the rectangle has zero area
        if (Math.abs(this.currentPoint.x - this.startPoint.x) < 0.001 || 
            Math.abs(this.currentPoint.y - this.startPoint.y) < 0.001) {
            logger.warn('Rectangle tool: Cannot create zero-area rectangle');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Check if shift key is pressed for square mode
        this.squareMode = event.shiftKey;
        
        // Create the rectangle
        this.createRectangle();
        
        // Reset for next rectangle
        this.reset();
        
        this.updateStatusHint();
        
        logger.info(`Rectangle tool: Second corner set at ${currentPointStr}`);
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
        
        // Handle shift key for square mode
        if (event.key === 'Shift' && this.mouseDown) {
            this.squareMode = true;
            this.updatePreviewRectangle();
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
            this.squareMode = false;
            this.updatePreviewRectangle();
        }
    }

    /**
     * Update the preview rectangle
     */
    updatePreviewRectangle() {
        if (!this.previewRect || !this.startPoint || !this.currentPoint) return;
        
        let width = this.currentPoint.x - this.startPoint.x;
        let height = this.currentPoint.y - this.startPoint.y;
        
        // Apply square constraint if in square mode
        if (this.squareMode) {
            const size = Math.max(Math.abs(width), Math.abs(height));
            width = width >= 0 ? size : -size;
            height = height >= 0 ? size : -size;
        }
        
        // Calculate the top-left corner
        const x = width >= 0 ? this.startPoint.x : this.startPoint.x + width;
        const y = height >= 0 ? this.startPoint.y : this.startPoint.y + height;
        
        // Update the preview rectangle
        this.previewRect.x = x;
        this.previewRect.y = y;
        this.previewRect.width = Math.abs(width);
        this.previewRect.height = Math.abs(height);
        
        this.canvasManager.setPreviewElement(this.previewRect);
    }

    /**
     * Create a rectangle
     */
    createRectangle() {
        if (!this.canvasManager || !this.startPoint || !this.currentPoint) return;
        
        let width = this.currentPoint.x - this.startPoint.x;
        let height = this.currentPoint.y - this.startPoint.y;
        
        // Apply square constraint if in square mode
        if (this.squareMode) {
            const size = Math.max(Math.abs(width), Math.abs(height));
            width = width >= 0 ? size : -size;
            height = height >= 0 ? size : -size;
        }
        
        // Calculate the top-left corner
        const x = width >= 0 ? this.startPoint.x : this.startPoint.x + width;
        const y = height >= 0 ? this.startPoint.y : this.startPoint.y + height;
        
        // Check if the rectangle has zero area
        if (Math.abs(width) < 0.001 || Math.abs(height) < 0.001) {
            logger.warn('Rectangle tool: Cannot create zero-area rectangle');
            return;
        }
        
        // Create the rectangle
        const rectangle = new Rectangle(
            x,
            y,
            Math.abs(width),
            Math.abs(height)
        );
        
        // Add the rectangle to the canvas
        this.canvasManager.addShape(rectangle);
        
        logger.info(`Rectangle created at (${x}, ${y}) with width ${Math.abs(width)} and height ${Math.abs(height)}`);
    }
}

// Create a singleton instance
const rectangleTool = new RectangleTool();

// Make rectangleTool available globally
window.rectangleTool = rectangleTool; 