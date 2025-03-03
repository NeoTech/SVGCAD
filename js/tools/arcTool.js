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
        this.radiusPoint = null;
        this.startAnglePoint = null;
        this.endAnglePoint = null;
        this.drawStage = 0; // 0: center, 1: radius, 2: start angle, 3: end angle
        this.radius = 0;
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
        this.previewArc = null;
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
        this.startAnglePoint = null;
        this.endAnglePoint = null;
        this.drawStage = 0;
        this.radius = 0;
        if (this.canvasManager) {
            this.canvasManager.clearPreview();
        }
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.previewArc = null;
        this.previewCircle = null;
        this.centerPoint = null;
        this.radiusPoint = null;
        this.startAnglePoint = null;
        this.endAnglePoint = null;
        this.drawStage = 0;
        this.radius = 0;
        if (this.canvasManager) {
            this.canvasManager.clearPreview();
        }
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        switch (this.drawStage) {
            case 0:
                this.statusHint = 'Arc: Click to set center point';
                break;
            case 1:
                this.statusHint = 'Arc: Click and drag to set radius';
                break;
            case 2:
                this.statusHint = 'Arc: Click on circle to set start angle';
                break;
            case 3:
                this.statusHint = 'Arc: Click on circle to set end angle and complete arc';
                break;
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
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        // Apply constraints
        const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
        
        // Process based on current draw stage
        switch (this.drawStage) {
            case 0: // Set center point
                this.centerPoint = new Point(constrainedPos.x, constrainedPos.y);
                this.mouseDown = true;
                
                // Create a preview circle with zero radius for immediate feedback
                this.previewCircle = new Circle(
                    this.centerPoint.x,
                    this.centerPoint.y,
                    0
                );
                
                this.canvasManager.setPreviewElement(this.previewCircle);
                this.drawStage = 1;
                
                logger.info(`Arc tool: Center point set at ${this.centerPoint.toString()}`);
                break;
                
            case 1: // Start setting radius
                // This is now handled in onMouseMove and onMouseUp
                break;
                
            case 2: // Set start angle
                // Calculate the vector from center to clicked point
                const dx = constrainedPos.x - this.centerPoint.x;
                const dy = constrainedPos.y - this.centerPoint.y;
                
                // Project the clicked point onto the circle
                const angle = Math.atan2(dy, dx);
                const projectedX = this.centerPoint.x + this.radius * Math.cos(angle);
                const projectedY = this.centerPoint.y + this.radius * Math.sin(angle);
                
                this.startAnglePoint = new Point(projectedX, projectedY);
                
                this.drawStage = 3;
                
                // Update the preview immediately
                this.updatePreview();
                
                logger.info(`Arc tool: Start angle set to ${angle * 180 / Math.PI} degrees`);
                break;
                
            case 3: // Set end angle and create arc
                // Calculate the vector from center to clicked point
                const dxEnd = constrainedPos.x - this.centerPoint.x;
                const dyEnd = constrainedPos.y - this.centerPoint.y;
                
                // Project the clicked point onto the circle
                const angleEnd = Math.atan2(dyEnd, dxEnd);
                const projectedXEnd = this.centerPoint.x + this.radius * Math.cos(angleEnd);
                const projectedYEnd = this.centerPoint.y + this.radius * Math.sin(angleEnd);
                
                this.endAnglePoint = new Point(projectedXEnd, projectedYEnd);
                
                // Store a message before creating the arc and resetting
                const message = "Arc tool: End angle set";
                
                // Create the arc
                this.createArc();
                
                // Reset for next arc
                this.reset();
                
                logger.info(message);
                break;
        }
        
        this.updateStatusHint();
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
        
        // Update preview based on current draw stage
        this.updatePreview();
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} event - The mouse event
     */
    onMouseUp(event) {
        if (!this.active || !this.canvasManager) return;
        
        // Only process mouse up for radius setting (stage 1)
        if (this.drawStage === 1 && this.mouseDown) {
            this.mouseDown = false;
            
            // Get mouse position in world coordinates
            const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
            const screenX = event.clientX - rect.left;
            const screenY = event.clientY - rect.top;
            const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
            
            // Apply constraints
            const constrainedPos = this.constraintManager.applyConstraints(worldPos.x, worldPos.y);
            
            this.radiusPoint = new Point(constrainedPos.x, constrainedPos.y);
            this.radius = this.centerPoint.distanceTo(this.radiusPoint);
            
            // Check if the radius is too small
            if (this.radius < 0.001) {
                logger.warn('Arc tool: Radius too small, please try again');
                this.reset();
                this.updateStatusHint();
                return;
            }
            
            // Keep the preview circle visible
            this.previewCircle.radius = this.radius;
            this.drawStage = 2;
            
            // Update the preview immediately
            this.updatePreview();
            
            logger.info(`Arc tool: Radius set to ${this.radius}`);
            this.updateStatusHint();
        }
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

    /**
     * Update the preview
     */
    updatePreview() {
        if (!this.canvasManager) {
            console.error("Canvas manager not available for preview");
            return;
        }
        
        // Create a preview group element
        const previewGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        try {
            switch (this.drawStage) {
                case 0: // No preview yet
                    break;
                    
                case 1: // Updating radius - show circle
                    if (this.centerPoint && this.currentPoint) {
                        const radius = this.centerPoint.distanceTo(this.currentPoint);
                        
                        // Create circle element
                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle.setAttribute('cx', this.centerPoint.x);
                        circle.setAttribute('cy', this.centerPoint.y);
                        circle.setAttribute('r', radius);
                        circle.setAttribute('stroke', '#0000ff');
                        circle.setAttribute('stroke-width', 1.5);
                        circle.setAttribute('fill', 'none');
                        previewGroup.appendChild(circle);
                        
                        // Create center point dot
                        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        centerDot.setAttribute('cx', this.centerPoint.x);
                        centerDot.setAttribute('cy', this.centerPoint.y);
                        centerDot.setAttribute('r', 3 / this.canvasManager.zoom);
                        centerDot.setAttribute('fill', '#0000ff');
                        previewGroup.appendChild(centerDot);
                        
                        // Set the preview
                        this.canvasManager.previewGroup.innerHTML = '';
                        this.canvasManager.previewGroup.appendChild(previewGroup);
                    }
                    break;
                    
                case 2: // Showing circle and potential start point
                    if (this.centerPoint && this.radius > 0 && this.currentPoint) {
                        // Calculate angle from center to current point
                        const dx = this.currentPoint.x - this.centerPoint.x;
                        const dy = this.currentPoint.y - this.centerPoint.y;
                        const angle = Math.atan2(dy, dx);
                        
                        // Project point onto circle
                        const projectedX = this.centerPoint.x + this.radius * Math.cos(angle);
                        const projectedY = this.centerPoint.y + this.radius * Math.sin(angle);
                        
                        // Create circle element
                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle.setAttribute('cx', this.centerPoint.x);
                        circle.setAttribute('cy', this.centerPoint.y);
                        circle.setAttribute('r', this.radius);
                        circle.setAttribute('stroke', '#0000ff');
                        circle.setAttribute('stroke-width', 1.5);
                        circle.setAttribute('fill', 'none');
                        previewGroup.appendChild(circle);
                        
                        // Create center point dot
                        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        centerDot.setAttribute('cx', this.centerPoint.x);
                        centerDot.setAttribute('cy', this.centerPoint.y);
                        centerDot.setAttribute('r', 3 / this.canvasManager.zoom);
                        centerDot.setAttribute('fill', '#0000ff');
                        previewGroup.appendChild(centerDot);
                        
                        // Create line from center to projected point
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', this.centerPoint.x);
                        line.setAttribute('y1', this.centerPoint.y);
                        line.setAttribute('x2', projectedX);
                        line.setAttribute('y2', projectedY);
                        line.setAttribute('stroke', '#ff0000');
                        line.setAttribute('stroke-width', 1);
                        line.setAttribute('stroke-dasharray', '3,3');
                        previewGroup.appendChild(line);
                        
                        // Create potential start point dot
                        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        dot.setAttribute('cx', projectedX);
                        dot.setAttribute('cy', projectedY);
                        dot.setAttribute('r', 4 / this.canvasManager.zoom);
                        dot.setAttribute('fill', '#ff0000');
                        previewGroup.appendChild(dot);
                        
                        // Set the preview
                        this.canvasManager.previewGroup.innerHTML = '';
                        this.canvasManager.previewGroup.appendChild(previewGroup);
                    }
                    break;
                    
                case 3: // Showing arc preview with start and end points
                    if (this.centerPoint && this.startAnglePoint && this.currentPoint) {
                        // Calculate start angle
                        const startAngle = Math.atan2(
                            this.startAnglePoint.y - this.centerPoint.y,
                            this.startAnglePoint.x - this.centerPoint.x
                        );
                        
                        // Calculate current angle from center to current point
                        const dx = this.currentPoint.x - this.centerPoint.x;
                        const dy = this.currentPoint.y - this.centerPoint.y;
                        const currentAngle = Math.atan2(dy, dx);
                        
                        // Project current point onto circle for end angle
                        const projectedX = this.centerPoint.x + this.radius * Math.cos(currentAngle);
                        const projectedY = this.centerPoint.y + this.radius * Math.sin(currentAngle);
                        
                        // Ensure the arc is drawn in the correct direction
                        let endAngle = currentAngle;
                        if (endAngle < startAngle) {
                            endAngle += Math.PI * 2;
                        }
                        
                        // Create full circle (dashed)
                        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        circle.setAttribute('cx', this.centerPoint.x);
                        circle.setAttribute('cy', this.centerPoint.y);
                        circle.setAttribute('r', this.radius);
                        circle.setAttribute('stroke', '#0000ff');
                        circle.setAttribute('stroke-width', 1);
                        circle.setAttribute('stroke-dasharray', '3,3');
                        circle.setAttribute('fill', 'none');
                        previewGroup.appendChild(circle);
                        
                        // Create center point dot
                        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        centerDot.setAttribute('cx', this.centerPoint.x);
                        centerDot.setAttribute('cy', this.centerPoint.y);
                        centerDot.setAttribute('r', 3 / this.canvasManager.zoom);
                        centerDot.setAttribute('fill', '#0000ff');
                        previewGroup.appendChild(centerDot);
                        
                        // Create line from center to start point
                        const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        startLine.setAttribute('x1', this.centerPoint.x);
                        startLine.setAttribute('y1', this.centerPoint.y);
                        startLine.setAttribute('x2', this.startAnglePoint.x);
                        startLine.setAttribute('y2', this.startAnglePoint.y);
                        startLine.setAttribute('stroke', '#ff0000');
                        startLine.setAttribute('stroke-width', 1);
                        startLine.setAttribute('stroke-dasharray', '3,3');
                        previewGroup.appendChild(startLine);
                        
                        // Create start point dot
                        const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        startDot.setAttribute('cx', this.startAnglePoint.x);
                        startDot.setAttribute('cy', this.startAnglePoint.y);
                        startDot.setAttribute('r', 4 / this.canvasManager.zoom);
                        startDot.setAttribute('fill', '#ff0000');
                        previewGroup.appendChild(startDot);
                        
                        // Create line from center to current point
                        const endLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        endLine.setAttribute('x1', this.centerPoint.x);
                        endLine.setAttribute('y1', this.centerPoint.y);
                        endLine.setAttribute('x2', projectedX);
                        endLine.setAttribute('y2', projectedY);
                        endLine.setAttribute('stroke', '#0000ff');
                        endLine.setAttribute('stroke-width', 1);
                        endLine.setAttribute('stroke-dasharray', '3,3');
                        previewGroup.appendChild(endLine);
                        
                        // Create current end point dot
                        const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        endDot.setAttribute('cx', projectedX);
                        endDot.setAttribute('cy', projectedY);
                        endDot.setAttribute('r', 4 / this.canvasManager.zoom);
                        endDot.setAttribute('fill', '#0000ff');
                        previewGroup.appendChild(endDot);
                        
                        // Create arc preview
                        const arcPath = this.createArcPath(
                            this.centerPoint.x,
                            this.centerPoint.y,
                            this.radius,
                            startAngle,
                            endAngle
                        );
                        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        arc.setAttribute('d', arcPath);
                        arc.setAttribute('stroke', '#0000ff');
                        arc.setAttribute('stroke-width', 2);
                        arc.setAttribute('fill', 'none');
                        previewGroup.appendChild(arc);
                        
                        // Set the preview
                        this.canvasManager.previewGroup.innerHTML = '';
                        this.canvasManager.previewGroup.appendChild(previewGroup);
                    }
                    break;
            }
        } catch (error) {
            console.error("Error in updatePreview:", error);
        }
    }
    
    /**
     * Create an SVG arc path
     * @param {number} cx - Center X
     * @param {number} cy - Center Y
     * @param {number} r - Radius
     * @param {number} startAngle - Start angle in radians
     * @param {number} endAngle - End angle in radians
     * @returns {string} - SVG path data
     */
    createArcPath(cx, cy, r, startAngle, endAngle) {
        // Calculate start and end points
        const startX = cx + r * Math.cos(startAngle);
        const startY = cy + r * Math.sin(startAngle);
        const endX = cx + r * Math.cos(endAngle);
        const endY = cy + r * Math.sin(endAngle);
        
        // Determine if the arc is larger than 180 degrees
        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
        
        // Create the SVG path
        return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    }

    /**
     * Create an arc
     */
    createArc() {
        if (!this.canvasManager || !this.centerPoint || !this.startAnglePoint || !this.endAnglePoint) {
            logger.error('Arc tool: Missing required points for arc creation');
            return;
        }
        
        const startAngle = Math.atan2(
            this.startAnglePoint.y - this.centerPoint.y,
            this.startAnglePoint.x - this.centerPoint.x
        );
        
        const endAngle = Math.atan2(
            this.endAnglePoint.y - this.centerPoint.y,
            this.endAnglePoint.x - this.centerPoint.x
        );
        
        // Ensure the arc is drawn in the correct direction
        let adjustedEndAngle = endAngle;
        if (endAngle < startAngle) {
            adjustedEndAngle += Math.PI * 2;
        }
        
        // Check if the arc has zero radius
        if (this.radius < 0.001) {
            logger.warn('Arc tool: Cannot create zero-radius arc');
            return;
        }
        
        // Check if start and end angles are the same (or very close)
        if (Math.abs(adjustedEndAngle - startAngle) < 0.001 || 
            Math.abs(adjustedEndAngle - startAngle - Math.PI * 2) < 0.001) {
            logger.warn('Arc tool: Start and end angles are the same');
            return;
        }
        
        try {
            // Create the arc
            const arc = new Arc(
                this.centerPoint.x,
                this.centerPoint.y,
                this.radius,
                startAngle,
                adjustedEndAngle
            );
            
            // Add the arc to the canvas
            this.canvasManager.addShape(arc);
            
            logger.info(`Arc created at (${this.centerPoint.x}, ${this.centerPoint.y}) with radius ${this.radius}, ` +
                       `start angle ${startAngle * 180 / Math.PI}° and end angle ${adjustedEndAngle * 180 / Math.PI}°`);
        } catch (error) {
            logger.error(`Arc tool: Error creating arc: ${error.message}`);
        }
    }
}

// Create a singleton instance
const arcTool = new ArcTool();

// Make arcTool available globally
window.arcTool = arcTool; 