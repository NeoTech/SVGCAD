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
        this.radius = 0;
        this.originalRadius = 0;
        this.currentCircle = null; // Store the actual circle being edited
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
        this.radius = 0;
        this.originalRadius = 0;
        this.currentCircle = null;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
        this.radius = 0;
        this.originalRadius = 0;
        this.currentCircle = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = 'Circle: Click and drag to create a circle, press Tab for precise input';
        
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
        
        // Calculate radius
        this.radius = this.centerPoint.distanceTo(this.radiusPoint);
        
        // Check if the circle has zero radius
        if (this.radius < 0.001) {
            logger.warn('Circle tool: Cannot create zero-radius circle');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Create the circle preview but don't add it to the canvas yet
        this.createCirclePreview();
        
        // Show dimension input
        this.showDimensionInput(event);
        
        logger.info(`Circle tool: Radius point set at ${radiusPointStr}`);
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
        this.radius = this.centerPoint.distanceTo(this.currentPoint);
        
        // Update preview circle
        this.previewCircle.centerX = this.centerPoint.x;
        this.previewCircle.centerY = this.centerPoint.y;
        this.previewCircle.radius = this.radius;
        
        this.canvasManager.setPreviewElement(this.previewCircle);
    }

    /**
     * Create a circle preview
     */
    createCirclePreview() {
        if (!this.canvasManager || !this.centerPoint) return;
        
        // Check if the circle has zero radius
        if (this.radius < 0.001) {
            logger.warn('Circle tool: Cannot create zero-radius circle');
            return;
        }
        
        // Create the circle but don't add it to the canvas yet
        this.currentCircle = new Circle(
            this.centerPoint.x,
            this.centerPoint.y,
            this.radius
        );
        
        // Set as preview
        this.previewCircle = this.currentCircle;
        this.canvasManager.setPreviewElement(this.previewCircle);
        
        logger.info(`Circle preview created at (${this.centerPoint.x}, ${this.centerPoint.y}) with radius ${this.radius}`);
    }
    
    /**
     * Commit the current circle to the canvas
     */
    commitCircle() {
        if (!this.canvasManager || !this.currentCircle) return;
        
        // Add the circle to the canvas
        this.canvasManager.addShape(this.currentCircle);
        
        logger.info(`Circle committed to canvas at (${this.currentCircle.cx}, ${this.currentCircle.cy}) with radius ${this.currentCircle.radius}`);
        
        // Store the created circle before resetting
        const createdCircle = this.currentCircle;
        
        // Reset for next circle
        this.reset();
        
        // Switch to Select tool and select the newly created circle
        if (this.appState) {
            this.appState.switchToSelectToolAndSelectShape(createdCircle);
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
        
        // Store original radius for preview
        this.originalRadius = this.radius;
        
        // Create a custom container for radius input
        const container = document.createElement('div');
        container.className = 'dimension-input-container circle-dimensions';
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
        
        // Radius input
        const radiusContainer = document.createElement('div');
        radiusContainer.style.display = 'flex';
        radiusContainer.style.alignItems = 'center';
        
        const radiusLabel = document.createElement('label');
        radiusLabel.textContent = 'Radius:';
        radiusLabel.style.marginRight = '5px';
        radiusLabel.style.minWidth = '60px';
        
        const radiusInput = document.createElement('input');
        radiusInput.type = 'number';
        radiusInput.step = '0.1';
        radiusInput.value = this.radius.toFixed(2);
        radiusInput.style.width = '80px';
        
        radiusContainer.appendChild(radiusLabel);
        radiusContainer.appendChild(radiusInput);
        
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
        container.appendChild(radiusContainer);
        container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(container);
        
        // Focus radius input
        radiusInput.focus();
        radiusInput.select();
        
        // Handle input events for real-time preview
        const updatePreview = () => {
            const radius = parseFloat(radiusInput.value);
            
            if (!isNaN(radius) && radius > 0) {
                this.previewDimension(radius, 'radius');
            }
        };
        
        let inputTimeout;
        radiusInput.addEventListener('input', () => {
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
        
        radiusInput.addEventListener('keydown', handleKeyDown);
        
        // Apply changes
        const applyChanges = () => {
            const radius = parseFloat(radiusInput.value);
            
            if (!isNaN(radius) && radius > 0) {
                // Update the current circle with new radius
                if (this.currentCircle) {
                    this.currentCircle.radius = radius;
                    
                    // Commit the circle to the canvas
                    this.commitCircle();
                }
            }
            
            // Remove the custom container
            document.body.removeChild(container);
        };
        
        // Cancel changes
        const cancelChanges = () => {
            // Reset to original radius
            if (this.previewCircle) {
                this.previewCircle.radius = this.originalRadius;
                this.canvasManager.setPreviewElement(this.previewCircle);
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
        if (!this.previewCircle || !this.centerPoint) return;
        
        if (dimensionType === 'radius') {
            // Update radius in preview
            this.previewCircle.radius = value;
        } else if (dimensionType === 'diameter') {
            // Update radius based on diameter
            this.previewCircle.radius = value / 2;
        }
        
        // Update the preview
        this.canvasManager.setPreviewElement(this.previewCircle);
    }
}

// Create a singleton instance
const circleTool = new CircleTool();

// Make circleTool available globally
window.circleTool = circleTool; 