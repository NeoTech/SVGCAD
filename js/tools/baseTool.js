/**
 * Base Tool class for the CAD Editor
 * Provides common functionality for all drawing tools
 */
class BaseTool {
    /**
     * Create a new BaseTool
     * @param {string} name - The name of the tool
     */
    constructor(name) {
        this.name = name || 'base';
        this.active = false;
        this.canvasManager = null;
        this.constraintManager = null;
        this.appState = null;
        this.mouseDown = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.statusHint = '';
    }

    /**
     * Initialize the tool
     * @param {CanvasManager} canvasManager - The Canvas Manager instance
     * @param {ConstraintManager} constraintManager - The Constraint Manager instance
     * @param {Object} appState - The Alpine.js application state
     */
    init(canvasManager, constraintManager, appState) {
        this.canvasManager = canvasManager;
        this.constraintManager = constraintManager;
        this.appState = appState;
        
        logger.info(`${this.name} tool initialized`);
    }

    /**
     * Activate the tool
     */
    activate() {
        if (!this.canvasManager || !this.constraintManager) {
            logger.error(`Cannot activate ${this.name} tool: managers not initialized`);
            return;
        }
        
        this.active = true;
        this.updateStatusHint();
        
        logger.info(`${this.name} tool activated`);
    }

    /**
     * Deactivate the tool
     */
    deactivate() {
        this.active = false;
        this.reset();
        
        logger.info(`${this.name} tool deactivated`);
    }

    /**
     * Reset the tool state
     */
    reset() {
        this.mouseDown = false;
        this.startPoint = null;
        this.currentPoint = null;
        
        if (this.canvasManager) {
            this.canvasManager.clearPreview();
        }
    }

    /**
     * Cancel the current operation
     */
    cancel() {
        this.reset();
        logger.info(`${this.name} tool operation cancelled`);
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = `${this.name} tool active`;
        
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
        
        logger.info(`${this.name} tool: Mouse down at ${this.startPoint.toString()}`);
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
        
        logger.info(`${this.name} tool: Mouse up at ${this.currentPoint.toString()}`);
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
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyUp(event) {
        if (!this.active) return;
    }

    /**
     * Handle double click event
     * @param {MouseEvent} event - The mouse event
     */
    onDoubleClick(event) {
        if (!this.active) return;
    }

    /**
     * Handle wheel event
     * @param {WheelEvent} event - The wheel event
     */
    onWheel(event) {
        if (!this.active) return;
    }

    /**
     * Handle context menu event
     * @param {MouseEvent} event - The mouse event
     */
    onContextMenu(event) {
        if (!this.active) return;
        
        // Prevent default context menu
        event.preventDefault();
    }
}

// Make BaseTool available globally
window.BaseTool = BaseTool; 