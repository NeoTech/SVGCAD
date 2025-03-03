/**
 * Rectangle Tool for the CAD Editor
 * Allows drawing rectangles by two corner points
 */
class RectangleTool extends BaseTool {
    /**
     * Create a new RectangleTool
     */
    constructor() {
        super('rectangle');
        this.previewRect = null;
        this.startPoint = null;
        this.squareMode = false;
        this.width = 0;
        this.height = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.currentRect = null; // Store the actual rectangle being edited
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
        this.startPoint = null;
        this.squareMode = false;
        this.width = 0;
        this.height = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.currentRect = null;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewRect = null;
        this.startPoint = null;
        this.squareMode = false;
        this.width = 0;
        this.height = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.currentRect = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = 'Rectangle: Click and drag to create a rectangle, hold Shift for square, press Tab for precise input';
        
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
        
        // Call the parent method to handle dimension input clicks
        super.onMouseDown(event);
        if (this.dimensionInput && this.dimensionInput.isVisible()) {
            return;
        }
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        // Set start point
        this.startPoint = new Point(constrainedPos.x, constrainedPos.y);
        this.mouseDown = true;
        
        // Create a preview rectangle with zero width and height
        this.previewRect = new Rectangle(
            this.startPoint.x,
            this.startPoint.y,
            0,
            0
        );
        
        this.canvasManager.setPreviewElement(this.previewRect);
        
        logger.info(`Rectangle tool: Start point set at ${this.startPoint.toString()}`);
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseMove(event) {
        if (!this.active || !this.canvasManager) return;
        
        // Call the parent method to handle dimension input position updates
        super.onMouseMove(event);
        
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
        if (this.mouseDown && this.previewRect && this.startPoint) {
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
        
        const endPoint = new Point(constrainedPos.x, constrainedPos.y);
        
        // Calculate width and height
        this.width = Math.abs(endPoint.x - this.startPoint.x);
        this.height = Math.abs(endPoint.y - this.startPoint.y);
        
        // Check if the rectangle has zero area
        if (this.width < 0.001 || this.height < 0.001) {
            logger.warn('Rectangle tool: Cannot create zero-area rectangle');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Create the rectangle but don't add it to the canvas yet
        this.createRectanglePreview(endPoint);
        
        // Show dimension input
        this.showDimensionInput(event);
        
        logger.info(`Rectangle tool: End point set at ${endPoint.toString()}`);
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyDown(event) {
        if (!this.active) return;
        
        // Call the parent method to handle common key events
        super.onKeyDown(event);
        
        // Handle escape key to cancel
        if (event.key === 'Escape') {
            this.cancel();
            event.preventDefault();
            return;
        }
        
        // Handle shift key for square mode
        if (event.key === 'Shift') {
            this.squareMode = true;
            
            // Update preview if we're drawing
            if (this.mouseDown && this.previewRect && this.startPoint) {
                this.updatePreviewRectangle();
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
        if (event.key === 'Shift') {
            this.squareMode = false;
            
            // Update preview if we're drawing
            if (this.mouseDown && this.previewRect && this.startPoint) {
                this.updatePreviewRectangle();
            }
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
     * Update the preview rectangle
     */
    updatePreviewRectangle() {
        if (!this.startPoint || !this.currentPoint || !this.previewRect) return;
        
        // Calculate width and height
        let width = this.currentPoint.x - this.startPoint.x;
        let height = this.currentPoint.y - this.startPoint.y;
        
        // If square mode is enabled, make width and height equal
        if (this.squareMode) {
            const size = Math.max(Math.abs(width), Math.abs(height));
            width = width >= 0 ? size : -size;
            height = height >= 0 ? size : -size;
        }
        
        // Store dimensions for dimension input
        this.width = Math.abs(width);
        this.height = Math.abs(height);
        
        // Calculate top-left corner
        const x = width >= 0 ? this.startPoint.x : this.startPoint.x + width;
        const y = height >= 0 ? this.startPoint.y : this.startPoint.y + height;
        
        // Update preview rectangle
        this.previewRect.x = x;
        this.previewRect.y = y;
        this.previewRect.width = Math.abs(width);
        this.previewRect.height = Math.abs(height);
        
        this.canvasManager.setPreviewElement(this.previewRect);
    }

    /**
     * Create a rectangle preview
     * @param {Point} endPoint - The end point of the rectangle
     */
    createRectanglePreview(endPoint) {
        if (!this.canvasManager || !this.startPoint) return;
        
        // Calculate width and height
        let width = endPoint.x - this.startPoint.x;
        let height = endPoint.y - this.startPoint.y;
        
        // If square mode is enabled, make width and height equal
        if (this.squareMode) {
            const size = Math.max(Math.abs(width), Math.abs(height));
            width = width >= 0 ? size : -size;
            height = height >= 0 ? size : -size;
        }
        
        // Store dimensions for dimension input
        this.width = Math.abs(width);
        this.height = Math.abs(height);
        
        // Calculate top-left corner
        const x = width >= 0 ? this.startPoint.x : this.startPoint.x + width;
        const y = height >= 0 ? this.startPoint.y : this.startPoint.y + height;
        
        // Create the rectangle but don't add it to the canvas yet
        this.currentRect = new Rectangle(
            x,
            y,
            Math.abs(width),
            Math.abs(height)
        );
        
        // Set as preview
        this.previewRect = this.currentRect;
        this.canvasManager.setPreviewElement(this.previewRect);
        
        logger.info(`Rectangle preview created at (${x}, ${y}) with width ${Math.abs(width)} and height ${Math.abs(height)}`);
    }
    
    /**
     * Commit the current rectangle to the canvas
     */
    commitRectangle() {
        if (!this.canvasManager || !this.currentRect) return;
        
        // Add the rectangle to the canvas
        this.canvasManager.addShape(this.currentRect);
        
        logger.info(`Rectangle committed to canvas at (${this.currentRect.x}, ${this.currentRect.y}) with width ${this.currentRect.width} and height ${this.currentRect.height}`);
        
        // Store the created rectangle before resetting
        const createdRect = this.currentRect;
        
        // Reset for next rectangle
        this.reset();
        
        // Switch to Select tool and select the newly created rectangle
        if (this.appState) {
            this.appState.switchToSelectToolAndSelectShape(createdRect);
        }
    }
    
    /**
     * Show dimension input
     * @param {MouseEvent} event - The mouse event
     */
    showDimensionInput(event) {
        if (!this.dimensionInput) return;
        
        // Get screen position for the input
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenPos = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Store original dimensions for preview
        this.originalWidth = this.width;
        this.originalHeight = this.height;
        
        // Create a custom container for width and height inputs
        const container = document.createElement('div');
        container.className = 'dimension-input-container rectangle-dimensions';
        container.style.position = 'absolute';
        container.style.left = `${screenPos.x + 20}px`;
        container.style.top = `${screenPos.y - 10}px`;
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '5px';
        container.style.padding = '10px';
        container.style.backgroundColor = '#f0f0f0';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        container.style.zIndex = '1000';
        
        // Width input
        const widthContainer = document.createElement('div');
        widthContainer.style.display = 'flex';
        widthContainer.style.alignItems = 'center';
        
        const widthLabel = document.createElement('label');
        widthLabel.textContent = 'Width:';
        widthLabel.style.marginRight = '5px';
        widthLabel.style.minWidth = '60px';
        
        const widthInput = document.createElement('input');
        widthInput.type = 'number';
        widthInput.step = '0.1';
        widthInput.value = this.width.toFixed(2);
        widthInput.style.width = '80px';
        
        widthContainer.appendChild(widthLabel);
        widthContainer.appendChild(widthInput);
        
        // Height input
        const heightContainer = document.createElement('div');
        heightContainer.style.display = 'flex';
        heightContainer.style.alignItems = 'center';
        
        const heightLabel = document.createElement('label');
        heightLabel.textContent = 'Height:';
        heightLabel.style.marginRight = '5px';
        heightLabel.style.minWidth = '60px';
        
        const heightInput = document.createElement('input');
        heightInput.type = 'number';
        heightInput.step = '0.1';
        heightInput.value = this.height.toFixed(2);
        heightInput.style.width = '80px';
        
        heightContainer.appendChild(heightLabel);
        heightContainer.appendChild(heightInput);
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '5px';
        
        const applyButton = document.createElement('button');
        applyButton.textContent = 'OK';
        applyButton.style.padding = '5px 10px';
        applyButton.style.backgroundColor = '#4CAF50';
        applyButton.style.color = 'white';
        applyButton.style.border = 'none';
        applyButton.style.borderRadius = '3px';
        applyButton.style.cursor = 'pointer';
        
        buttonContainer.appendChild(applyButton);
        
        // Add all elements to container
        container.appendChild(widthContainer);
        container.appendChild(heightContainer);
        container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(container);
        
        // Focus width input
        widthInput.focus();
        widthInput.select();
        
        // Handle input events for real-time preview
        const updatePreview = () => {
            const width = parseFloat(widthInput.value);
            const height = parseFloat(heightInput.value);
            
            if (!isNaN(width) && width > 0 && !isNaN(height) && height > 0) {
                this.previewDimension(width, 'width');
                this.previewDimension(height, 'height');
            }
        };
        
        let inputTimeout;
        widthInput.addEventListener('input', () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(updatePreview, 50);
        });
        
        heightInput.addEventListener('input', () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(updatePreview, 50);
        });
        
        // Handle key events
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                applyChanges();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                cancelChanges();
                event.preventDefault();
            }
        };
        
        widthInput.addEventListener('keydown', handleKeyDown);
        heightInput.addEventListener('keydown', handleKeyDown);
        
        // Apply changes
        const applyChanges = () => {
            const width = parseFloat(widthInput.value);
            const height = parseFloat(heightInput.value);
            
            if (!isNaN(width) && width > 0 && !isNaN(height) && height > 0) {
                // Update the current rectangle with new dimensions
                if (this.currentRect) {
                    this.currentRect.width = width;
                    this.currentRect.height = height;
                    
                    // Commit the rectangle to the canvas
                    this.commitRectangle();
                }
            }
            
            // Remove the custom container
            document.body.removeChild(container);
        };
        
        // Cancel changes
        const cancelChanges = () => {
            // Reset to original dimensions
            if (this.previewRect) {
                this.previewRect.width = this.originalWidth;
                this.previewRect.height = this.originalHeight;
                this.canvasManager.setPreviewElement(this.previewRect);
            }
            
            // Remove the custom container
            document.body.removeChild(container);
            
            // Reset the tool
            this.reset();
        };
        
        // Apply button click
        applyButton.addEventListener('click', applyChanges);
        
        // Store reference to remove event listeners
        this.dimensionInputActive = true;
    }
    
    /**
     * Preview dimension changes in real-time
     * @param {number} value - The new dimension value
     * @param {string} dimensionType - The type of dimension being changed
     */
    previewDimension(value, dimensionType) {
        if (!this.previewRect || !this.startPoint) return;
        
        if (dimensionType === 'width') {
            // Update width in preview
            this.previewRect.width = value;
        } else if (dimensionType === 'height') {
            // Update height in preview
            this.previewRect.height = value;
        }
        
        // Update the preview
        this.canvasManager.setPreviewElement(this.previewRect);
    }
}

// Create a singleton instance
const rectangleTool = new RectangleTool();

// Make rectangleTool available globally
window.rectangleTool = rectangleTool; 