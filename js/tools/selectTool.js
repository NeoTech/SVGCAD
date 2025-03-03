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
        this.propertiesPanel = null;
    }

    /**
     * Initialize the tool
     * @param {CanvasManager} canvasManager - The canvas manager
     * @param {AppStateManager} appState - The application state manager
     */
    init(canvasManager, appState) {
        super.init(canvasManager, appState);
        
        // Initialize properties panel
        if (!this.propertiesPanel && this.canvasManager) {
            this.propertiesPanel = new PropertiesPanel(this.canvasManager);
        }
    }

    /**
     * Activate the tool
     */
    activate() {
        super.activate();
        this.updateStatusHint();
        
        // Initialize properties panel if not already created
        if (!this.propertiesPanel && this.canvasManager) {
            this.propertiesPanel = new PropertiesPanel(this.canvasManager);
        }
    }

    /**
     * Deactivate the tool
     */
    deactivate() {
        super.deactivate();
        this.selectedShapes = [];
        this.selectionRect = null;
        this.dragging = false;
        
        // Hide properties panel
        if (this.propertiesPanel) {
            this.propertiesPanel.hideProperties();
        }
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
            this.statusHint = 'Select: Click to select a shape, drag to select multiple shapes, or hold Ctrl/Shift for multi-selection';
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
        
        // Check if modifier key is pressed (Ctrl or Shift for multi-selection)
        const isMultiSelectModifier = event.ctrlKey || event.shiftKey;
        
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
        
        // Find all shapes at the clicked point
        const shapesAtPoint = this.canvasManager.findShapesAtPoint(
            this.startPoint.x, 
            this.startPoint.y,
            5
        );
        
        if (shapesAtPoint.length > 0) {
            // Get the first shape at the point
            const clickedShape = shapesAtPoint[0];
            
            // Check if we're clicking on an already selected shape
            const isClickingSelectedShape = this.selectedShapes.some(shape => shape.id === clickedShape.id);
            
            if (isClickingSelectedShape) {
                // If clicking on an already selected shape with modifier key, deselect it
                if (isMultiSelectModifier) {
                    this.canvasManager.deselectElement(clickedShape.id);
                    this.selectedShapes = this.selectedShapes.filter(shape => shape.id !== clickedShape.id);
                    
                    // Update properties panel if needed
                    if (this.selectedShapes.length === 1 && this.propertiesPanel) {
                        this.propertiesPanel.showProperties(this.selectedShapes[0]);
                    } else if (this.propertiesPanel) {
                        this.propertiesPanel.hideProperties();
                    }
                } else {
                    // If clicking on an already selected shape without modifier, just start dragging
                    this.dragging = true;
                    this.dragMode = 'move';
                }
            } else {
                // If clicking on a different shape
                if (isMultiSelectModifier) {
                    // Add to selection if modifier key is pressed
                    this.selectedShapes.push(clickedShape);
                    this.canvasManager.selectElements(clickedShape, false);
                    
                    // Update properties panel if needed
                    if (this.selectedShapes.length === 1 && this.propertiesPanel) {
                        this.propertiesPanel.showProperties(this.selectedShapes[0]);
                    } else if (this.propertiesPanel) {
                        this.propertiesPanel.hideProperties();
                    }
                } else {
                    // If no modifier key, deselect all and select the new one
                    this.canvasManager.deselectAll();
                    this.selectedShapes = [clickedShape];
                    this.canvasManager.selectElements(clickedShape);
                    
                    // Show properties for the selected shape
                    if (this.propertiesPanel) {
                        this.propertiesPanel.showProperties(clickedShape);
                    }
                }
                
                // Start dragging the shape
                this.dragging = true;
                this.dragMode = 'move';
            }
        } else {
            // If clicking on empty space
            if (!isMultiSelectModifier) {
                // Deselect all if not using modifier key
                this.canvasManager.deselectAll();
                this.selectedShapes = [];
                
                // Hide properties panel
                if (this.propertiesPanel) {
                    this.propertiesPanel.hideProperties();
                }
            }
            
            // Start selection rectangle
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
                
                // Calculate normalized rectangle coordinates (ensure positive width/height)
                const x = this.selectionRect.width >= 0 ? this.startPoint.x : this.currentPoint.x;
                const y = this.selectionRect.height >= 0 ? this.startPoint.y : this.currentPoint.y;
                const width = Math.abs(this.selectionRect.width);
                const height = Math.abs(this.selectionRect.height);
                
                // Preview the selection rectangle
                const previewRect = new Rectangle(x, y, width, height);
                
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
        
        // Check if modifier key is pressed (Ctrl or Shift for multi-selection)
        const isMultiSelectModifier = event.ctrlKey || event.shiftKey;
        
        if (this.dragging) {
            // Finalize the drag operation
            this.dragging = false;
            this.canvasManager.clearPreview();
            
            // Update properties panel if a single shape is selected
            if (this.selectedShapes.length === 1 && this.propertiesPanel) {
                this.propertiesPanel.updateProperties(this.selectedShapes[0]);
            }
        } else if (this.selectionRect) {
            // Normalize the selection rectangle (handle negative width/height)
            const x = Math.min(this.startPoint.x, this.currentPoint.x);
            const y = Math.min(this.startPoint.y, this.currentPoint.y);
            const width = Math.abs(this.currentPoint.x - this.startPoint.x);
            const height = Math.abs(this.currentPoint.y - this.startPoint.y);
            
            // Find shapes in the selection rectangle
            const shapesInRect = this.canvasManager.findShapesInRect(x, y, width, height);
            
            if (shapesInRect.length > 0) {
                if (isMultiSelectModifier) {
                    // Add to existing selection if modifier key is pressed
                    this.canvasManager.selectElements(shapesInRect, false);
                    
                    // Update selectedShapes array
                    shapesInRect.forEach(shape => {
                        if (!this.selectedShapes.some(s => s.id === shape.id)) {
                            this.selectedShapes.push(shape);
                        }
                    });
                } else {
                    // Replace selection if no modifier key
                    this.canvasManager.deselectAll();
                    this.selectedShapes = [...shapesInRect];
                    this.canvasManager.selectElements(shapesInRect);
                }
                
                // Update properties panel
                if (this.selectedShapes.length === 1 && this.propertiesPanel) {
                    this.propertiesPanel.showProperties(this.selectedShapes[0]);
                } else if (this.propertiesPanel) {
                    this.propertiesPanel.hideProperties();
                }
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
            let clone;
            
            if (shape.type === 'line') {
                clone = new Line(
                    shape.x1 + dx,
                    shape.y1 + dy,
                    shape.x2 + dx,
                    shape.y2 + dy
                );
                clone.id = shape.id;
            } else if (shape.type === 'rectangle') {
                clone = new Rectangle(
                    shape.x + dx,
                    shape.y + dy,
                    shape.width,
                    shape.height
                );
                clone.id = shape.id;
            } else if (shape.type === 'circle') {
                clone = new Circle(
                    shape.cx + dx,
                    shape.cy + dy,
                    shape.radius
                );
                clone.id = shape.id;
            } else if (shape.type === 'arc') {
                clone = new Arc(
                    shape.cx + dx,
                    shape.cy + dy,
                    shape.radius,
                    shape.startAngle,
                    shape.endAngle
                );
                clone.id = shape.id;
            } else {
                // Fallback for unknown shape types
                clone = { ...shape };
                if (clone.x !== undefined) clone.x += dx;
                if (clone.y !== undefined) clone.y += dy;
                if (clone.cx !== undefined) clone.cx += dx;
                if (clone.cy !== undefined) clone.cy += dy;
                if (clone.x1 !== undefined) clone.x1 += dx;
                if (clone.y1 !== undefined) clone.y1 += dy;
                if (clone.x2 !== undefined) clone.x2 += dx;
                if (clone.y2 !== undefined) clone.y2 += dy;
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
        
        // Update properties panel if a single shape is selected
        if (this.selectedShapes.length === 1 && this.propertiesPanel) {
            this.propertiesPanel.updateProperties(this.selectedShapes[0]);
        }
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
        
        // Hide properties panel
        if (this.propertiesPanel) {
            this.propertiesPanel.hideProperties();
        }
        
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
        
        // Hide properties panel if multiple shapes are selected
        if (this.propertiesPanel) {
            if (this.selectedShapes.length === 1) {
                this.propertiesPanel.showProperties(this.selectedShapes[0]);
            } else {
                this.propertiesPanel.hideProperties();
            }
        }
        
        this.updateStatusHint();
        
        logger.info('Selected all shapes');
    }

    /**
     * Handle canvas manager events
     * @param {string} event - The event name
     * @param {Object} data - The event data
     */
    handleCanvasManagerEvent(event, data) {
        if (!this.active) return;
        
        switch (event) {
            case 'selectionChanged':
                this.selectedShapes = [...this.canvasManager.selectedElements];
                this.updateStatusHint();
                break;
                
            case 'selectionCleared':
                this.selectedShapes = [];
                this.updateStatusHint();
                break;
                
            // Add other events as needed
        }
    }
}

// Create a singleton instance
const selectTool = new SelectTool();

// Make selectTool available globally
window.selectTool = selectTool; 