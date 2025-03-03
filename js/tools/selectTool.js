/**
 * Select Tool for the CAD Editor
 * Allows selecting and manipulating shapes
 */
class SelectTool extends BaseTool {
    /**
     * Create a new SelectTool
     */
    constructor() {
        super('select');
        this.selectionRect = null;
        this.selectedShapes = [];
        this.dragging = false;
        this.dragStartPoint = null;
        this.lastDragPoint = null;
        this.dragMode = 'move'; // 'move', 'resize', 'rotate'
        this.resizeHandle = null;
        this.rotateCenter = null;
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
        this.selectedShapes = [];
        this.selectionRect = null;
        this.dragging = false;
    }

    /**
     * Reset the tool state
     */
    reset() {
        super.reset();
        this.selectionRect = null;
        this.dragging = false;
        this.dragStartPoint = null;
        this.lastDragPoint = null;
        this.dragMode = 'move';
        this.resizeHandle = null;
        this.rotateCenter = null;
    }

    /**
     * Update the status hint
     */
    updateStatusHint() {
        if (this.selectedShapes.length === 0) {
            this.statusHint = 'Select: Click to select a shape, or drag to select multiple shapes';
        } else if (this.selectedShapes.length === 1) {
            this.statusHint = 'Select: Shape selected. Drag to move, press Delete to remove';
        } else {
            this.statusHint = `Select: ${this.selectedShapes.length} shapes selected. Drag to move, press Delete to remove`;
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
        
        this.mouseDown = true;
        
        // Get mouse position in world coordinates
        const rect = this.canvasManager.canvasOverlay.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const worldPos = this.canvasManager.screenToWorld(screenX, screenY);
        
        this.startPoint = new Point(worldPos.x, worldPos.y);
        this.currentPoint = this.startPoint.clone();
        this.dragStartPoint = this.startPoint.clone();
        this.lastDragPoint = this.startPoint.clone();
        
        // Check if clicking on a resize handle
        if (this.isOnResizeHandle(this.startPoint.x, this.startPoint.y)) {
            this.dragging = true;
            this.dragMode = 'resize';
            return;
        }
        
        // Check if clicking on a rotate handle
        if (this.isOnRotateHandle(this.startPoint.x, this.startPoint.y)) {
            this.dragging = true;
            this.dragMode = 'rotate';
            return;
        }
        
        // Check if clicking on a selected shape
        const clickedOnSelected = this.selectedShapes.some(shape => {
            if (shape.type === 'line') {
                return shape.isPointOnLine(this.startPoint.x, this.startPoint.y, 5);
            } else if (shape.type === 'rectangle') {
                return shape.containsPoint(this.startPoint.x, this.startPoint.y);
            } else if (shape.type === 'circle') {
                return shape.isPointOnCircumference(this.startPoint.x, this.startPoint.y, 5);
            } else if (shape.type === 'arc') {
                return shape.isPointOnArc(this.startPoint.x, this.startPoint.y, 5);
            }
            return false;
        });
        
        if (clickedOnSelected) {
            // Start dragging selected shapes
            this.dragging = true;
            this.dragMode = 'move';
            return;
        }
        
        // Check if clicking on any shape
        const shapesAtPoint = this.canvasManager.findShapesAtPoint(
            this.startPoint.x, 
            this.startPoint.y,
            5
        );
        
        if (shapesAtPoint.length > 0) {
            // Select the shape if not holding shift
            if (!event.shiftKey) {
                this.selectedShapes = [shapesAtPoint[0]];
                this.canvasManager.selectElements(this.selectedShapes);
            } else {
                // Add to selection if holding shift
                this.selectedShapes.push(shapesAtPoint[0]);
                this.canvasManager.selectElements(this.selectedShapes);
            }
            
            // Start dragging the shape
            this.dragging = true;
            this.dragMode = 'move';
        } else {
            // Start selection rectangle if not clicking on any shape
            if (!event.shiftKey) {
                this.selectedShapes = [];
                this.canvasManager.deselectAll();
            }
            
            this.selectionRect = {
                x: this.startPoint.x,
                y: this.startPoint.y,
                width: 0,
                height: 0
            };
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
        
        this.currentPoint = new Point(worldPos.x, worldPos.y);
        
        // Update mouse position in app state
        if (this.appState) {
            this.appState.mousePosition = { 
                x: this.currentPoint.x, 
                y: this.currentPoint.y 
            };
        }
        
        // Handle dragging
        if (this.mouseDown) {
            if (this.dragging) {
                if (this.dragMode === 'move') {
                    this.handleDragMove();
                } else if (this.dragMode === 'resize') {
                    this.handleDragResize();
                } else if (this.dragMode === 'rotate') {
                    this.handleDragRotate();
                }
            } else if (this.selectionRect) {
                // Update selection rectangle
                this.selectionRect.width = this.currentPoint.x - this.startPoint.x;
                this.selectionRect.height = this.currentPoint.y - this.startPoint.y;
                
                // Preview the selection rectangle
                const previewRect = new Rectangle(
                    this.selectionRect.x,
                    this.selectionRect.y,
                    this.selectionRect.width,
                    this.selectionRect.height
                );
                
                this.canvasManager.setPreviewElement(previewRect);
            }
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
        
        this.currentPoint = new Point(worldPos.x, worldPos.y);
        
        if (this.dragging) {
            // Finalize the drag operation
            this.dragging = false;
            this.canvasManager.clearPreview();
        } else if (this.selectionRect) {
            // Normalize the selection rectangle (handle negative width/height)
            const x = Math.min(this.startPoint.x, this.currentPoint.x);
            const y = Math.min(this.startPoint.y, this.currentPoint.y);
            const width = Math.abs(this.currentPoint.x - this.startPoint.x);
            const height = Math.abs(this.currentPoint.y - this.startPoint.y);
            
            // Find shapes in the selection rectangle
            const shapesInRect = this.canvasManager.findShapesInRect(x, y, width, height);
            
            if (shapesInRect.length > 0) {
                // Add to existing selection if shift key is pressed
                if (event.shiftKey) {
                    this.selectedShapes = [...this.selectedShapes, ...shapesInRect];
                } else {
                    this.selectedShapes = shapesInRect;
                }
                
                this.canvasManager.selectElements(this.selectedShapes);
            }
            
            this.selectionRect = null;
            this.canvasManager.clearPreview();
        }
        
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
        
        // Handle delete key to remove selected shapes
        if (event.key === 'Delete' && this.selectedShapes.length > 0) {
            this.deleteSelectedShapes();
            event.preventDefault();
            return;
        }
        
        // Handle Ctrl+A to select all
        if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            this.selectAll();
            event.preventDefault();
            return;
        }
    }

    /**
     * Handle drag move operation
     */
    handleDragMove() {
        if (!this.canvasManager || this.selectedShapes.length === 0) return;
        
        const dx = this.currentPoint.x - this.lastDragPoint.x;
        const dy = this.currentPoint.y - this.lastDragPoint.y;
        
        if (dx === 0 && dy === 0) return;
        
        // Move each selected shape
        const movedShapes = this.selectedShapes.map(shape => {
            const clone = JSON.parse(JSON.stringify(shape));
            
            if (shape.type === 'line') {
                clone.x1 += dx;
                clone.y1 += dy;
                clone.x2 += dx;
                clone.y2 += dy;
            } else if (shape.type === 'rectangle') {
                clone.x += dx;
                clone.y += dy;
            } else if (shape.type === 'circle' || shape.type === 'arc') {
                clone.cx += dx;
                clone.cy += dy;
            }
            
            return clone;
        });
        
        // Preview the moved shapes
        this.canvasManager.clearPreview();
        
        // Update last drag point
        this.lastDragPoint = this.currentPoint.clone();
        
        // Update the actual shapes
        movedShapes.forEach(shape => {
            const originalShape = this.selectedShapes.find(s => s.id === shape.id);
            
            if (shape.type === 'line') {
                originalShape.x1 = shape.x1;
                originalShape.y1 = shape.y1;
                originalShape.x2 = shape.x2;
                originalShape.y2 = shape.y2;
            } else if (shape.type === 'rectangle') {
                originalShape.x = shape.x;
                originalShape.y = shape.y;
            } else if (shape.type === 'circle' || shape.type === 'arc') {
                originalShape.cx = shape.cx;
                originalShape.cy = shape.cy;
            }
            
            this.canvasManager.updateShape(originalShape);
        });
    }

    /**
     * Handle drag resize operation
     */
    handleDragResize() {
        // Implement resize logic here
        // This is a placeholder for the resize functionality
    }

    /**
     * Handle drag rotate operation
     */
    handleDragRotate() {
        // Implement rotate logic here
        // This is a placeholder for the rotate functionality
    }

    /**
     * Check if a point is on a resize handle
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if the point is on a resize handle
     */
    isOnResizeHandle(x, y) {
        // Implement resize handle detection here
        // This is a placeholder for the resize handle detection
        return false;
    }

    /**
     * Check if a point is on a rotate handle
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if the point is on a rotate handle
     */
    isOnRotateHandle(x, y) {
        // Implement rotate handle detection here
        // This is a placeholder for the rotate handle detection
        return false;
    }

    /**
     * Delete selected shapes
     */
    deleteSelectedShapes() {
        if (!this.canvasManager || this.selectedShapes.length === 0) return;
        
        // Remove each selected shape
        this.selectedShapes.forEach(shape => {
            this.canvasManager.removeShape(shape.id);
        });
        
        this.selectedShapes = [];
        this.updateStatusHint();
        
        logger.info('Deleted selected shapes');
    }

    /**
     * Select all shapes
     */
    selectAll() {
        if (!this.canvasManager) return;
        
        this.selectedShapes = [...this.canvasManager.shapes];
        this.canvasManager.selectElements(this.selectedShapes);
        this.updateStatusHint();
        
        logger.info('Selected all shapes');
    }
}

// Create a singleton instance
const selectTool = new SelectTool();

// Make selectTool available globally
window.selectTool = selectTool; 