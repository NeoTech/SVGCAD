/**
 * Arc Tool for the CAD Editor
 * Allows drawing arcs by center, radius, and angles
 */
class ArcTool extends BaseTool {
    /**
     * Create a new ArcTool
     */
    constructor() {
        super('arc');
        this.previewArc = null;
        this.previewCircle = null;
        this.centerPoint = null;
        this.radius = 0;
        this.startAngle = 0;
        this.endAngle = 0;
        this.originalRadius = 0;
        this.originalStartAngle = 0;
        this.originalEndAngle = 0;
        this.currentArc = null;
        this.dimensionInputActive = false;
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
        this.reset();
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewArc = null;
        this.previewCircle = null;
        this.centerPoint = null;
        this.radius = 0;
        this.startAngle = 0;
        this.endAngle = 0;
        this.originalRadius = 0;
        this.originalStartAngle = 0;
        this.originalEndAngle = 0;
        this.currentArc = null;
        this.dimensionInputActive = false;
        if (this.canvasManager) {
            this.canvasManager.clearPreview();
        }
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        this.statusHint = 'Arc: Click to set center point or press Tab for precise input';
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
        if (this.dimensionInputActive) {
            return;
        }
        
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        this.centerPoint = new Point(constrainedPos.x, constrainedPos.y);
        this.mouseDown = true;
        
        // Create a preview circle with zero radius
        this.previewCircle = new Circle(
            this.centerPoint.x,
            this.centerPoint.y,
            0
        );
        
        this.canvasManager.setPreviewElement(this.previewCircle);
        
        logger.info(`Arc tool: Center point set at ${this.centerPoint.toString()}`);
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseMove(event) {
        if (!this.active || !this.canvasManager) return;
        
        // Call the parent method to handle dimension input position updates
        super.onMouseMove(event);
        
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
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
        
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        const radiusPoint = new Point(constrainedPos.x, constrainedPos.y);
        
        // Calculate radius
        this.radius = this.centerPoint.distanceTo(radiusPoint);
        
        // Check if the arc has zero radius
        if (this.radius < 0.001) {
            logger.warn('Arc tool: Cannot create zero-radius arc');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Set default angles
        this.startAngle = 0;
        this.endAngle = 90;
        
        // Create the arc preview but don't add it to the canvas yet
        this.createArcPreview();
        
        // Show dimension input
        this.showDimensionInput(event);
        
        logger.info(`Arc tool: Radius set to ${this.radius}`);
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyDown(event) {
        if (!this.active) return;
        
        // Call the parent method to handle common key events
        super.onKeyDown(event);
        
        if (event.key === 'Escape') {
            this.cancel();
            event.preventDefault();
            return;
        }
        
        if (event.key === 'Tab' && !this.dimensionInputActive) {
            // Create a default center point if none exists
            if (!this.centerPoint) {
                this.centerPoint = new Point(0, 0);
                this.radius = 10;
                this.startAngle = 0;
                this.endAngle = 90;
                this.createArcPreview();
            }
            
            // Show dimension input at a default position
            const defaultEvent = {
                clientX: window.innerWidth / 2,
                clientY: window.innerHeight / 2
            };
            this.showDimensionInput(defaultEvent);
            event.preventDefault();
        }
    }

    /**
     * Update the preview circle
     */
    updatePreviewCircle() {
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
     * Create an arc preview
     */
    createArcPreview() {
        if (!this.canvasManager || !this.centerPoint) return;
        
        // Check if the arc has zero radius
        if (this.radius < 0.001) {
            logger.warn('Arc tool: Cannot create zero-radius arc');
            return;
        }
        
        // Convert angles to radians
        const startAngleRad = this.startAngle * (Math.PI / 180);
        const endAngleRad = this.endAngle * (Math.PI / 180);
        
        // Create the arc but don't add it to the canvas yet
        this.currentArc = new Arc(
            this.centerPoint.x,
            this.centerPoint.y,
            this.radius,
            startAngleRad,
            endAngleRad
        );
        
        // Set as preview
        this.previewArc = this.currentArc;
        this.canvasManager.setPreviewElement(this.previewArc);
        
        logger.info(`Arc preview created at (${this.centerPoint.x}, ${this.centerPoint.y}) with radius ${this.radius}`);
    }
    
    /**
     * Commit the current arc to the canvas
     */
    commitArc() {
        if (!this.canvasManager || !this.currentArc) return;
        
        // Add the arc to the canvas
        this.canvasManager.addShape(this.currentArc);
        
        logger.info(`Arc committed to canvas at (${this.currentArc.centerX}, ${this.currentArc.centerY}) with radius ${this.currentArc.radius}`);
        
        // Reset for next arc
        this.reset();
    }

    /**
     * Show dimension input
     * @param {MouseEvent} event - The mouse event
     */
    showDimensionInput(event) {
        // Store original values for preview
        this.originalRadius = this.radius;
        this.originalStartAngle = this.startAngle;
        this.originalEndAngle = this.endAngle;
        
        // Create a custom container for arc input
        const container = document.createElement('div');
        container.className = 'dimension-input-container arc-dimensions';
        container.style.position = 'absolute';
        container.style.left = `${event.clientX + 20}px`;
        container.style.top = `${event.clientY - 10}px`;
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
        radiusLabel.style.minWidth = '80px';
        
        const radiusInput = document.createElement('input');
        radiusInput.type = 'number';
        radiusInput.step = '0.1';
        radiusInput.value = this.radius.toFixed(2);
        radiusInput.style.width = '80px';
        
        radiusContainer.appendChild(radiusLabel);
        radiusContainer.appendChild(radiusInput);
        
        // Start angle input
        const startAngleContainer = document.createElement('div');
        startAngleContainer.style.display = 'flex';
        startAngleContainer.style.alignItems = 'center';
        
        const startAngleLabel = document.createElement('label');
        startAngleLabel.textContent = 'Start Angle:';
        startAngleLabel.style.marginRight = '5px';
        startAngleLabel.style.minWidth = '80px';
        
        const startAngleInput = document.createElement('input');
        startAngleInput.type = 'number';
        startAngleInput.step = '1';
        startAngleInput.value = this.startAngle.toFixed(0);
        startAngleInput.style.width = '80px';
        
        startAngleContainer.appendChild(startAngleLabel);
        startAngleContainer.appendChild(startAngleInput);
        
        // End angle input
        const endAngleContainer = document.createElement('div');
        endAngleContainer.style.display = 'flex';
        endAngleContainer.style.alignItems = 'center';
        
        const endAngleLabel = document.createElement('label');
        endAngleLabel.textContent = 'End Angle:';
        endAngleLabel.style.marginRight = '5px';
        endAngleLabel.style.minWidth = '80px';
        
        const endAngleInput = document.createElement('input');
        endAngleInput.type = 'number';
        endAngleInput.step = '1';
        endAngleInput.value = this.endAngle.toFixed(0);
        endAngleInput.style.width = '80px';
        
        endAngleContainer.appendChild(endAngleLabel);
        endAngleContainer.appendChild(endAngleInput);
        
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
        container.appendChild(startAngleContainer);
        container.appendChild(endAngleContainer);
        container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(container);
        
        // Focus radius input
        radiusInput.focus();
        radiusInput.select();
        
        // Handle input events for real-time preview
        const updatePreview = () => {
            const radius = parseFloat(radiusInput.value);
            const startAngle = parseFloat(startAngleInput.value);
            const endAngle = parseFloat(endAngleInput.value);
            
            if (!isNaN(radius) && radius > 0 && 
                !isNaN(startAngle) && !isNaN(endAngle)) {
                this.previewDimensions(radius, startAngle, endAngle);
            }
        };
        
        let inputTimeout;
        const handleInput = () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(updatePreview, 50);
        };
        
        radiusInput.addEventListener('input', handleInput);
        startAngleInput.addEventListener('input', handleInput);
        endAngleInput.addEventListener('input', handleInput);
        
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
        startAngleInput.addEventListener('keydown', handleKeyDown);
        endAngleInput.addEventListener('keydown', handleKeyDown);
        
        // Apply changes
        const applyChanges = () => {
            const radius = parseFloat(radiusInput.value);
            const startAngle = parseFloat(startAngleInput.value);
            const endAngle = parseFloat(endAngleInput.value);
            
            if (!isNaN(radius) && radius > 0 && 
                !isNaN(startAngle) && !isNaN(endAngle)) {
                // Update the current arc with new values
                if (this.currentArc) {
                    this.radius = radius;
                    this.startAngle = startAngle;
                    this.endAngle = endAngle;
                    
                    // Create a new arc with updated values
                    this.createArcPreview();
                    
                    // Commit the arc to the canvas
                    this.commitArc();
                }
            }
            
            // Remove the custom container
            document.body.removeChild(container);
            this.dimensionInputActive = false;
        };
        
        // Cancel changes
        const cancelChanges = () => {
            // Reset to original values
            this.radius = this.originalRadius;
            this.startAngle = this.originalStartAngle;
            this.endAngle = this.originalEndAngle;
            
            if (this.previewArc) {
                this.createArcPreview();
            }
            
            // Remove the custom container
            document.body.removeChild(container);
            this.dimensionInputActive = false;
            
            // Reset the tool
            this.reset();
        };
        
        // Apply button click
        applyButton.addEventListener('click', applyChanges);
        
        // Set dimension input as active
        this.dimensionInputActive = true;
    }
    
    /**
     * Preview dimension changes in real-time
     * @param {number} radius - The new radius value
     * @param {number} startAngle - The new start angle value
     * @param {number} endAngle - The new end angle value
     */
    previewDimensions(radius, startAngle, endAngle) {
        if (!this.centerPoint) return;
        
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        
        // Create a new arc preview with updated dimensions
        this.createArcPreview();
    }

    /**
     * Cancel the current operation
     */
    cancel() {
        super.cancel();
        this.reset();
        this.updateStatusHint();
        logger.info('Arc tool: Operation cancelled');
    }
}

// Create a singleton instance
const arcTool = new ArcTool();

// Make arcTool available globally
window.arcTool = arcTool; 