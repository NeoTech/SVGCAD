/**
 * Line Tool for the CAD Editor
 * Allows drawing lines by two points
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
        this.lineLength = 0;
        this.lineAngle = 0;
        this.originalLength = 0;
        this.originalAngle = 0;
        this.currentLine = null; // Store the actual line being edited
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
        this.lastEndPoint = null;
        this.lineLength = 0;
        this.lineAngle = 0;
        this.originalLength = 0;
        this.originalAngle = 0;
        this.currentLine = null;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewLine = null;
        if (!this.continuousMode) {
            this.lastEndPoint = null;
        }
        this.lineLength = 0;
        this.lineAngle = 0;
        this.originalLength = 0;
        this.originalAngle = 0;
        this.currentLine = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        if (this.continuousMode && this.lastEndPoint) {
            this.statusHint = 'Line: Click to place next point, press Escape to exit continuous mode, press Tab for precise input';
        } else {
            this.statusHint = 'Line: Click and drag to create a line, press Tab for precise input';
        }
        
        if (this.appState) {
            this.appState.statusHint = this.statusHint;
        }
    }

    /**
     * Set continuous mode
     * @param {boolean} enabled - Whether continuous mode is enabled
     */
    setContinuousMode(enabled) {
        this.continuousMode = enabled;
        logger.info(`Line tool: Continuous mode ${enabled ? 'enabled' : 'disabled'}`);
        this.updateStatusHint();
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
        
        // In continuous mode, use the last end point as the start point
        if (this.continuousMode && this.lastEndPoint) {
            this.startPoint = this.lastEndPoint.clone();
        } else {
            this.startPoint = new Point(constrainedPos.x, constrainedPos.y);
        }
        
        this.mouseDown = true;
        
        // Create a preview line
        this.previewLine = new Line(
            this.startPoint.x,
            this.startPoint.y,
            this.startPoint.x,
            this.startPoint.y
        );
        
        this.canvasManager.setPreviewElement(this.previewLine);
        
        logger.info(`Line tool: Start point set at ${this.startPoint.toString()}`);
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
        
        // Update preview line if we're drawing
        if (this.mouseDown && this.previewLine && this.startPoint) {
            this.updatePreviewLine();
            this.calculateLineDimensions();
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
        
        // Calculate line dimensions
        this.calculateLineDimensions(endPoint);
        
        // Check if the line has zero length
        if (this.lineLength < 0.001) {
            logger.warn('Line tool: Cannot create zero-length line');
            this.reset();
            this.updateStatusHint();
            return;
        }
        
        // Create the line preview but don't add it to the canvas yet
        this.createLinePreview(endPoint);
        
        // Show dimension input
        this.showDimensionInput(event);
        
        logger.info(`Line tool: End point set at ${endPoint.toString()}`);
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    onKeyDown(event) {
        if (!this.active) return;
        
        // Call the parent method to handle common key events
        super.onKeyDown(event);
        
        // Handle escape key to cancel or exit continuous mode
        if (event.key === 'Escape') {
            if (this.continuousMode && this.lastEndPoint) {
                this.lastEndPoint = null;
                this.updateStatusHint();
                logger.info('Line tool: Exited continuous mode');
            } else {
                this.cancel();
            }
            event.preventDefault();
            return;
        }
        
        // Handle shift key for horizontal/vertical constraint
        if (event.key === 'Shift' && this.mouseDown) {
            this.updatePreviewLine(true);
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
            this.updatePreviewLine(false);
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
     * Update the preview line
     * @param {boolean} constrained - Whether to apply horizontal/vertical constraint
     */
    updatePreviewLine(constrained = false) {
        if (!this.startPoint || !this.currentPoint || !this.previewLine) return;
        
        let endX = this.currentPoint.x;
        let endY = this.currentPoint.y;
        
        // Apply horizontal/vertical constraint if shift is pressed
        if (constrained) {
            const dx = Math.abs(this.currentPoint.x - this.startPoint.x);
            const dy = Math.abs(this.currentPoint.y - this.startPoint.y);
            
            if (dx > dy) {
                // Horizontal constraint
                endY = this.startPoint.y;
            } else {
                // Vertical constraint
                endX = this.startPoint.x;
            }
        }
        
        // Update preview line
        this.previewLine.x1 = this.startPoint.x;
        this.previewLine.y1 = this.startPoint.y;
        this.previewLine.x2 = endX;
        this.previewLine.y2 = endY;
        
        this.canvasManager.setPreviewElement(this.previewLine);
    }

    /**
     * Create a line preview
     * @param {Point} endPoint - The end point of the line
     */
    createLinePreview(endPoint) {
        if (!this.canvasManager || !this.startPoint) return;
        
        // Create the line but don't add it to the canvas yet
        this.currentLine = new Line(
            this.startPoint.x,
            this.startPoint.y,
            endPoint.x,
            endPoint.y
        );
        
        // Set as preview
        this.previewLine = this.currentLine;
        this.canvasManager.setPreviewElement(this.previewLine);
        
        logger.info(`Line preview created from (${this.startPoint.x}, ${this.startPoint.y}) to (${endPoint.x}, ${endPoint.y})`);
    }
    
    /**
     * Commit the current line to the canvas
     */
    commitLine() {
        if (!this.canvasManager || !this.currentLine) return;
        
        // Add the line to the canvas
        this.canvasManager.addShape(this.currentLine);
        
        logger.info(`Line committed to canvas from (${this.currentLine.x1}, ${this.currentLine.y1}) to (${this.currentLine.x2}, ${this.currentLine.y2})`);
        
        // In continuous mode, set the last end point for the next line
        if (this.continuousMode) {
            this.lastEndPoint = new Point(this.currentLine.x2, this.currentLine.y2);
            this.updateStatusHint();
        } else {
            // Reset for next line
            this.reset();
        }
    }
    
    /**
     * Calculate line dimensions
     * @param {Point} [endPoint] - The end point of the line (optional, uses currentPoint if not provided)
     */
    calculateLineDimensions(endPoint) {
        if (!this.startPoint) return;
        
        const end = endPoint || this.currentPoint;
        if (!end) return;
        
        // Calculate length
        this.lineLength = this.startPoint.distanceTo(end);
        
        // Calculate angle in degrees
        const dx = end.x - this.startPoint.x;
        const dy = end.y - this.startPoint.y;
        this.lineAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Normalize angle to 0-360 range
        if (this.lineAngle < 0) {
            this.lineAngle += 360;
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
        this.originalLength = this.lineLength;
        this.originalAngle = this.lineAngle;
        
        // Create a custom container for length and angle inputs
        const container = document.createElement('div');
        container.className = 'dimension-input-container line-dimensions';
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
        
        // Length input
        const lengthContainer = document.createElement('div');
        lengthContainer.style.display = 'flex';
        lengthContainer.style.alignItems = 'center';
        
        const lengthLabel = document.createElement('label');
        lengthLabel.textContent = 'Length:';
        lengthLabel.style.marginRight = '5px';
        lengthLabel.style.minWidth = '60px';
        
        const lengthInput = document.createElement('input');
        lengthInput.type = 'number';
        lengthInput.step = '0.1';
        lengthInput.value = this.lineLength.toFixed(2);
        lengthInput.style.width = '80px';
        
        lengthContainer.appendChild(lengthLabel);
        lengthContainer.appendChild(lengthInput);
        
        // Angle input
        const angleContainer = document.createElement('div');
        angleContainer.style.display = 'flex';
        angleContainer.style.alignItems = 'center';
        
        const angleLabel = document.createElement('label');
        angleLabel.textContent = 'Angle:';
        angleLabel.style.marginRight = '5px';
        angleLabel.style.minWidth = '60px';
        
        const angleInput = document.createElement('input');
        angleInput.type = 'number';
        angleInput.step = '1';
        angleInput.min = '0';
        angleInput.max = '360';
        angleInput.value = this.lineAngle.toFixed(2);
        angleInput.style.width = '80px';
        
        angleContainer.appendChild(angleLabel);
        angleContainer.appendChild(angleInput);
        
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
        container.appendChild(lengthContainer);
        container.appendChild(angleContainer);
        container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(container);
        
        // Focus length input
        lengthInput.focus();
        lengthInput.select();
        
        // Handle input events for real-time preview
        const updatePreview = () => {
            const length = parseFloat(lengthInput.value);
            const angle = parseFloat(angleInput.value);
            
            if (!isNaN(length) && length > 0 && !isNaN(angle)) {
                // Calculate new end point
                const angleRad = angle * Math.PI / 180;
                const endX = this.startPoint.x + length * Math.cos(angleRad);
                const endY = this.startPoint.y + length * Math.sin(angleRad);
                
                // Update preview line
                if (this.previewLine) {
                    this.previewLine.x1 = this.startPoint.x;
                    this.previewLine.y1 = this.startPoint.y;
                    this.previewLine.x2 = endX;
                    this.previewLine.y2 = endY;
                    
                    this.canvasManager.setPreviewElement(this.previewLine);
                }
            }
        };
        
        let inputTimeout;
        lengthInput.addEventListener('input', () => {
            if (inputTimeout) clearTimeout(inputTimeout);
            inputTimeout = setTimeout(updatePreview, 50);
        });
        
        angleInput.addEventListener('input', () => {
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
        
        lengthInput.addEventListener('keydown', handleKeyDown);
        angleInput.addEventListener('keydown', handleKeyDown);
        
        // Apply changes
        const applyChanges = () => {
            const length = parseFloat(lengthInput.value);
            const angle = parseFloat(angleInput.value);
            
            if (!isNaN(length) && length > 0 && !isNaN(angle)) {
                // Calculate new end point
                const angleRad = angle * Math.PI / 180;
                const endX = this.startPoint.x + length * Math.cos(angleRad);
                const endY = this.startPoint.y + length * Math.sin(angleRad);
                
                // Update the current line with new end point
                if (this.currentLine) {
                    this.currentLine.x2 = endX;
                    this.currentLine.y2 = endY;
                    
                    // Commit the line to the canvas
                    this.commitLine();
                }
            }
            
            // Remove the custom container
            document.body.removeChild(container);
        };
        
        // Cancel changes
        const cancelChanges = () => {
            // Reset to original dimensions
            if (this.previewLine && this.originalLength > 0) {
                const angleRad = this.originalAngle * Math.PI / 180;
                const endX = this.startPoint.x + this.originalLength * Math.cos(angleRad);
                const endY = this.startPoint.y + this.originalLength * Math.sin(angleRad);
                
                this.previewLine.x1 = this.startPoint.x;
                this.previewLine.y1 = this.startPoint.y;
                this.previewLine.x2 = endX;
                this.previewLine.y2 = endY;
                
                this.canvasManager.setPreviewElement(this.previewLine);
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
        if (!this.previewLine || !this.startPoint) return;
        
        let length = this.lineLength;
        let angle = this.lineAngle;
        
        if (dimensionType === 'length') {
            // Update length in preview
            length = value;
        } else if (dimensionType === 'angle') {
            // Update angle in preview
            angle = value;
        }
        
        // Calculate new end point
        const angleRad = angle * Math.PI / 180;
        const endX = this.startPoint.x + length * Math.cos(angleRad);
        const endY = this.startPoint.y + length * Math.sin(angleRad);
        
        // Update preview line
        this.previewLine.x1 = this.startPoint.x;
        this.previewLine.y1 = this.startPoint.y;
        this.previewLine.x2 = endX;
        this.previewLine.y2 = endY;
        
        // Update the preview
        this.canvasManager.setPreviewElement(this.previewLine);
    }
}

// Create a singleton instance
const lineTool = new LineTool();

// Make lineTool available globally
window.lineTool = lineTool; 