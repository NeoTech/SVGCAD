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
        this.dimensionInput = null;
        this.dimensionInputActive = false;
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
        
        // Initialize dimension input if not already created
        if (!window.globalDimensionInput) {
            window.globalDimensionInput = new DimensionInput(canvasManager);
        }
        this.dimensionInput = window.globalDimensionInput;
        
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
        
        // Hide dimension input if visible
        if (this.dimensionInput && this.dimensionInput.isVisible()) {
            this.dimensionInput.hide();
        }
        
        logger.info(`${this.name} tool deactivated`);
    }

    /**
     * Reset the tool state
     */
    reset() {
        this.mouseDown = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.dimensionInputActive = false;
        
        // Hide dimension input if visible
        if (this.dimensionInput && this.dimensionInput.isVisible()) {
            this.dimensionInput.hide();
        }
        
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
        
        // If dimension input is visible, check if we clicked on it
        if (this.dimensionInput && this.dimensionInput.isVisible()) {
            // Check if click is inside the dimension input
            const inputRect = this.dimensionInput.container.getBoundingClientRect();
            if (event.clientX >= inputRect.left && event.clientX <= inputRect.right &&
                event.clientY >= inputRect.top && event.clientY <= inputRect.bottom) {
                // Click is inside the input, don't process further
                return;
            } else {
                // Click is outside, apply the current value and hide
                this.dimensionInput.applyValue();
            }
        }
        
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
        
        // Update dimension input position if visible
        if (this.dimensionInput && this.dimensionInput.isVisible()) {
            const screenPos = {
                x: event.clientX,
                y: event.clientY
            };
            this.dimensionInput.updatePosition(screenPos);
            
            // Update dimension value if needed
            this.updateDimensionInputValue();
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
        
        // Show dimension input if appropriate
        this.showDimensionInput(event);
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
        
        // Handle Tab key to activate dimension input
        if (event.key === 'Tab' && !this.dimensionInputActive) {
            this.activateDimensionInput();
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
    
    /**
     * Show dimension input
     * @param {MouseEvent} event - The mouse event
     */
    showDimensionInput(event) {
        // This method should be overridden by derived classes
        // to show appropriate dimension inputs
    }
    
    /**
     * Update dimension input value
     */
    updateDimensionInputValue() {
        // This method should be overridden by derived classes
        // to update the dimension input value based on current state
    }
    
    /**
     * Activate dimension input
     */
    activateDimensionInput() {
        // This method should be overridden by derived classes
        // to activate the dimension input when Tab is pressed
    }
    
    /**
     * Tab between dimension inputs
     */
    tabDimensionInput() {
        // This method should be overridden by derived classes
        // to handle tabbing between multiple dimension inputs
    }
    
    /**
     * Apply dimension value
     * @param {string} dimensionType - The type of dimension
     * @param {number} value - The value to apply
     */
    applyDimensionValue(dimensionType, value) {
        // This method should be overridden by derived classes
        // to apply the dimension value
    }
}

// Make BaseTool available globally
window.BaseTool = BaseTool; 