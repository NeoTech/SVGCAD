/**
 * Canvas Manager for the CAD Editor
 * Handles the SVG canvas, rendering, and coordinate transformations
 */
class CanvasManager {
    /**
     * Create a new Canvas Manager
     */
    constructor() {
        this.initialized = false;
        this.canvas = null;
        this.canvasContainer = null;
        this.canvasOverlay = null;
        this.gridGroup = null;
        this.shapesGroup = null;
        this.previewGroup = null;
        this.selectionGroup = null;
        this.measurementGroup = null;
        this.shapes = [];
        this.selectedElements = [];
        this.previewElement = null;
        this.gridSize = 10;
        this.gridVisible = true;
        this.snapEnabled = true;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.width = 800;
        this.height = 600;
        this.appState = null;
    }

    /**
     * Initialize the Canvas Manager
     * @param {SVGElement} svgCanvas - The SVG canvas element
     * @param {HTMLElement} canvasOverlay - The canvas overlay element
     * @param {Object} appState - The application state
     */
    init(svgCanvas, canvasOverlay, appState) {
        if (this.initialized) {
            logger.warn('Canvas Manager already initialized');
            return;
        }

        try {
            this.appState = appState;
            
            // Set canvas elements from parameters
            this.canvas = svgCanvas;
            this.canvasOverlay = canvasOverlay;
            this.canvasContainer = document.getElementById('canvas-container');
            
            if (!this.canvas || !this.canvasContainer || !this.canvasOverlay) {
                throw new Error('Canvas elements not found');
            }
            
            // Get SVG groups
            this.gridGroup = document.getElementById('grid-group');
            this.shapesGroup = document.getElementById('shapes-group');
            this.previewGroup = document.getElementById('preview-group');
            this.selectionGroup = document.getElementById('selection-group');
            this.measurementGroup = document.getElementById('measurement-group');
            
            if (!this.gridGroup || !this.shapesGroup || !this.previewGroup || 
                !this.selectionGroup || !this.measurementGroup) {
                throw new Error('SVG groups not found');
            }
            
            // Set initial canvas size
            this.updateCanvasSize();
            
            // Add resize event listener
            window.addEventListener('resize', this.handleResize.bind(this));
            
            // Draw initial grid
            this.drawGrid();
            
            this.initialized = true;
            logger.info('Canvas Manager initialized successfully');
        } catch (error) {
            logger.error(`Failed to initialize Canvas Manager: ${error.message}`);
            throw error;
        }
    }

    /**
     * Handle window resize event
     */
    handleResize() {
        this.updateCanvasSize();
        this.drawGrid();
        this.render();
    }

    /**
     * Update the canvas size based on the container size
     */
    updateCanvasSize() {
        if (!this.canvasContainer || !this.canvas) return;
        
        const rect = this.canvasContainer.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);
        this.canvas.setAttribute('viewBox', `${-this.panX} ${-this.panY} ${this.width / this.zoom} ${this.height / this.zoom}`);
        
        logger.info(`Canvas size updated to ${this.width}x${this.height}`);
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.zoom + (-this.panX),
            y: screenY / this.zoom + (-this.panY)
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} Screen coordinates {x, y}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - (-this.panX)) * this.zoom,
            y: (worldY - (-this.panY)) * this.zoom
        };
    }

    /**
     * Snap coordinates to the grid if snapping is enabled
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Snapped coordinates {x, y}
     */
    snapToGrid(x, y) {
        if (!this.snapEnabled) return { x, y };
        
        return MathUtils.snapPointToGrid(x, y, this.gridSize);
    }

    /**
     * Set the grid size
     * @param {number} size - The new grid size
     */
    setGridSize(size) {
        this.gridSize = size;
        this.drawGrid();
        logger.info(`Grid size set to ${size}`);
    }

    /**
     * Toggle grid visibility
     * @param {boolean} [enabled] - Whether to enable or disable the grid
     */
    toggleGrid(enabled) {
        this.gridVisible = enabled !== undefined ? enabled : !this.gridVisible;
        this.drawGrid();
        
        if (this.appState) {
            this.appState.gridVisible = this.gridVisible;
        }
        
        logger.info(`Grid ${this.gridVisible ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle snap to grid
     * @param {boolean} enabled - Whether snap to grid should be enabled
     */
    toggleSnap(enabled) {
        this.snapEnabled = enabled !== undefined ? enabled : !this.snapEnabled;
        
        if (this.appState) {
            this.appState.snapEnabled = this.snapEnabled;
        }
        
        logger.info(`Snap to grid ${this.snapEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Draw the grid
     */
    drawGrid() {
        if (!this.gridGroup) return;
        
        // Clear existing grid
        while (this.gridGroup.firstChild) {
            this.gridGroup.removeChild(this.gridGroup.firstChild);
        }
        
        if (!this.gridVisible) return;
        
        const worldWidth = this.width / this.zoom;
        const worldHeight = this.height / this.zoom;
        
        const startX = Math.floor((-this.panX) / this.gridSize) * this.gridSize;
        const startY = Math.floor((-this.panY) / this.gridSize) * this.gridSize;
        const endX = (-this.panX) + worldWidth;
        const endY = (-this.panY) + worldHeight;
        
        // Draw vertical grid lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', x);
            line.setAttribute('y2', endY);
            line.setAttribute('class', 'grid-line');
            this.gridGroup.appendChild(line);
        }
        
        // Draw horizontal grid lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'grid-line');
            this.gridGroup.appendChild(line);
        }
    }

    /**
     * Set the zoom level
     * @param {number} zoom - The new zoom level
     * @param {number} centerX - X coordinate of the zoom center (in screen coordinates)
     * @param {number} centerY - Y coordinate of the zoom center (in screen coordinates)
     */
    setZoom(zoom, centerX, centerY) {
        if (zoom < 0.1 || zoom > 10) return;
        
        const worldCenterBefore = this.screenToWorld(centerX, centerY);
        
        this.zoom = zoom;
        
        const worldCenterAfter = this.screenToWorld(centerX, centerY);
        
        // Adjust pan to keep the center point fixed
        this.panX += (worldCenterAfter.x - worldCenterBefore.x);
        this.panY += (worldCenterAfter.y - worldCenterBefore.y);
        
        this.updateViewBox();
        this.drawGrid();
        
        logger.info(`Zoom set to ${zoom.toFixed(2)}`);
    }

    /**
     * Pan the canvas
     * @param {number} dx - X distance to pan
     * @param {number} dy - Y distance to pan
     */
    pan(dx, dy) {
        this.panX -= dx / this.zoom;
        this.panY -= dy / this.zoom;
        
        this.updateViewBox();
        this.drawGrid();
    }

    /**
     * Update the SVG viewBox
     */
    updateViewBox() {
        if (!this.canvas) return;
        
        this.canvas.setAttribute('viewBox', `${-this.panX} ${-this.panY} ${this.width / this.zoom} ${this.height / this.zoom}`);
    }

    /**
     * Add a shape to the canvas
     * @param {Object} shape - The shape to add
     */
    addShape(shape) {
        if (!shape) return;
        
        this.shapes.push(shape);
        this.render();
        
        logger.info(`Added ${shape.type} with ID ${shape.id}`);
    }

    /**
     * Remove a shape from the canvas
     * @param {string} id - The ID of the shape to remove
     */
    removeShape(id) {
        const index = this.shapes.findIndex(shape => shape.id === id);
        
        if (index !== -1) {
            const shape = this.shapes[index];
            this.shapes.splice(index, 1);
            
            // Remove from selection if selected
            this.deselectElement(id);
            
            this.render();
            
            logger.info(`Removed ${shape.type} with ID ${shape.id}`);
        }
    }

    /**
     * Update a shape on the canvas
     * @param {Object} shape - The shape to update
     */
    updateShape(shape) {
        if (!shape || !shape.id) return;
        
        const index = this.shapes.findIndex(s => s.id === shape.id);
        
        if (index !== -1) {
            this.shapes[index] = shape;
            this.render();
            
            logger.info(`Updated ${shape.type} with ID ${shape.id}`);
        }
    }

    /**
     * Get a shape by ID
     * @param {string} id - The ID of the shape to get
     * @returns {Object|null} The shape or null if not found
     */
    getShapeById(id) {
        return this.shapes.find(shape => shape.id === id) || null;
    }

    /**
     * Find shapes at a specific point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} tolerance - Distance tolerance
     * @returns {Array} Array of shapes at the point
     */
    findShapesAtPoint(x, y, tolerance = 5) {
        return this.shapes.filter(shape => {
            if (shape.type === 'line') {
                return shape.isPointOnLine(x, y, tolerance);
            } else if (shape.type === 'rectangle') {
                return shape.containsPoint(x, y);
            } else if (shape.type === 'circle') {
                return shape.isPointOnCircumference(x, y, tolerance);
            } else if (shape.type === 'arc') {
                return shape.isPointOnArc(x, y, tolerance);
            }
            return false;
        });
    }

    /**
     * Find shapes within a rectangle
     * @param {number} x - X coordinate of the top-left corner
     * @param {number} y - Y coordinate of the top-left corner
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @returns {Array} Array of shapes within the rectangle
     */
    findShapesInRect(x, y, width, height) {
        const rect = new Rectangle(x, y, width, height);
        
        return this.shapes.filter(shape => {
            if (shape.type === 'line') {
                return shape.intersectsWithRect(x, y, width, height);
            } else if (shape.type === 'rectangle') {
                return rect.intersectsWithRectangle(shape);
            } else if (shape.type === 'circle' || shape.type === 'arc') {
                const bbox = shape.getBoundingBox();
                return rect.intersectsWithRectangle(new Rectangle(bbox.x, bbox.y, bbox.width, bbox.height));
            }
            return false;
        });
    }

    /**
     * Select elements
     * @param {Array|Object} elements - The element(s) to select
     */
    selectElements(elements) {
        if (!elements) return;
        
        const elementsArray = Array.isArray(elements) ? elements : [elements];
        
        // Add new elements to selection
        elementsArray.forEach(element => {
            if (!this.selectedElements.some(e => e.id === element.id)) {
                this.selectedElements.push(element);
            }
        });
        
        this.renderSelection();
        
        if (this.appState) {
            this.appState.selectedElements = [...this.selectedElements];
        }
        
        logger.info(`Selected ${elementsArray.length} element(s)`);
    }

    /**
     * Deselect an element
     * @param {string} id - The ID of the element to deselect
     */
    deselectElement(id) {
        const index = this.selectedElements.findIndex(element => element.id === id);
        
        if (index !== -1) {
            this.selectedElements.splice(index, 1);
            this.renderSelection();
            
            if (this.appState) {
                this.appState.selectedElements = [...this.selectedElements];
            }
            
            logger.info(`Deselected element with ID ${id}`);
        }
    }

    /**
     * Deselect all elements
     */
    deselectAll() {
        this.selectedElements = [];
        this.renderSelection();
        
        if (this.appState) {
            this.appState.selectedElements = [];
        }
        
        logger.info('Deselected all elements');
    }

    /**
     * Set a preview element
     * @param {Object} element - The element to preview
     */
    setPreviewElement(element) {
        this.previewElement = element;
        this.renderPreview();
    }

    /**
     * Clear the preview
     */
    clearPreview() {
        this.previewElement = null;
        this.renderPreview();
    }

    /**
     * Render all shapes on the canvas
     */
    render() {
        if (!this.shapesGroup) return;
        
        // Clear existing shapes
        while (this.shapesGroup.firstChild) {
            this.shapesGroup.removeChild(this.shapesGroup.firstChild);
        }
        
        // Render each shape
        this.shapes.forEach(shape => {
            let element;
            
            if (shape.toSVGElement) {
                element = shape.toSVGElement();
            } else if (shape.type === 'line') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                element.setAttribute('x1', shape.x1);
                element.setAttribute('y1', shape.y1);
                element.setAttribute('x2', shape.x2);
                element.setAttribute('y2', shape.y2);
            } else if (shape.type === 'rectangle') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                element.setAttribute('x', shape.x);
                element.setAttribute('y', shape.y);
                element.setAttribute('width', shape.width);
                element.setAttribute('height', shape.height);
            } else if (shape.type === 'circle') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                element.setAttribute('cx', shape.cx);
                element.setAttribute('cy', shape.cy);
                element.setAttribute('r', shape.radius);
            } else if (shape.type === 'arc') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', shape.toSVGPathData());
            }
            
            if (element) {
                element.setAttribute('data-id', shape.id);
                element.setAttribute('data-type', shape.type);
                this.shapesGroup.appendChild(element);
            }
        });
        
        // Re-render selection and preview
        this.renderSelection();
        this.renderPreview();
    }

    /**
     * Render the selection
     */
    renderSelection() {
        if (!this.selectionGroup) return;
        
        // Clear existing selection
        while (this.selectionGroup.firstChild) {
            this.selectionGroup.removeChild(this.selectionGroup.firstChild);
        }
        
        // Render selection for each selected element
        this.selectedElements.forEach(element => {
            let selectionElement;
            
            if (element.type === 'line') {
                // For lines, draw a selection rectangle around the line
                const bbox = element.getBoundingBox();
                selectionElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                selectionElement.setAttribute('x', bbox.x - 5);
                selectionElement.setAttribute('y', bbox.y - 5);
                selectionElement.setAttribute('width', bbox.width + 10);
                selectionElement.setAttribute('height', bbox.height + 10);
            } else if (element.type === 'rectangle') {
                // For rectangles, draw a selection rectangle slightly larger
                selectionElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                selectionElement.setAttribute('x', element.x - 5);
                selectionElement.setAttribute('y', element.y - 5);
                selectionElement.setAttribute('width', element.width + 10);
                selectionElement.setAttribute('height', element.height + 10);
            } else if (element.type === 'circle' || element.type === 'arc') {
                // For circles and arcs, draw a selection rectangle around the bounding box
                const bbox = element.getBoundingBox();
                selectionElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                selectionElement.setAttribute('x', bbox.x - 5);
                selectionElement.setAttribute('y', bbox.y - 5);
                selectionElement.setAttribute('width', bbox.width + 10);
                selectionElement.setAttribute('height', bbox.height + 10);
            }
            
            if (selectionElement) {
                selectionElement.setAttribute('class', 'selection');
                selectionElement.setAttribute('data-for', element.id);
                this.selectionGroup.appendChild(selectionElement);
            }
        });
    }

    /**
     * Render the preview
     */
    renderPreview() {
        if (!this.previewGroup) return;
        
        // Clear existing preview
        while (this.previewGroup.firstChild) {
            this.previewGroup.removeChild(this.previewGroup.firstChild);
        }
        
        // Render preview element if exists
        if (this.previewElement) {
            let previewElement;
            
            if (this.previewElement.toSVGElement) {
                previewElement = this.previewElement.toSVGElement();
            } else if (this.previewElement.type === 'line') {
                previewElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                previewElement.setAttribute('x1', this.previewElement.x1);
                previewElement.setAttribute('y1', this.previewElement.y1);
                previewElement.setAttribute('x2', this.previewElement.x2);
                previewElement.setAttribute('y2', this.previewElement.y2);
            } else if (this.previewElement.type === 'rectangle') {
                previewElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                previewElement.setAttribute('x', this.previewElement.x);
                previewElement.setAttribute('y', this.previewElement.y);
                previewElement.setAttribute('width', this.previewElement.width);
                previewElement.setAttribute('height', this.previewElement.height);
            } else if (this.previewElement.type === 'circle') {
                previewElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                previewElement.setAttribute('cx', this.previewElement.cx);
                previewElement.setAttribute('cy', this.previewElement.cy);
                previewElement.setAttribute('r', this.previewElement.radius);
            } else if (this.previewElement.type === 'arc') {
                previewElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                previewElement.setAttribute('d', this.previewElement.toSVGPathData());
            }
            
            if (previewElement) {
                previewElement.setAttribute('class', 'preview');
                this.previewGroup.appendChild(previewElement);
            }
        }
    }

    /**
     * Clear all shapes from the canvas
     */
    clear() {
        this.shapes = [];
        this.selectedElements = [];
        this.previewElement = null;
        
        this.render();
        
        if (this.appState) {
            this.appState.selectedElements = [];
        }
        
        logger.info('Canvas cleared');
    }

    /**
     * Export the canvas to SVG
     * @returns {string} The SVG content
     */
    exportSVG() {
        if (!this.canvas) return '';
        
        // Create a clone of the canvas
        const clone = this.canvas.cloneNode(true);
        
        // Remove selection and preview groups
        const selectionGroup = clone.querySelector('#selection-group');
        const previewGroup = clone.querySelector('#preview-group');
        
        if (selectionGroup) selectionGroup.remove();
        if (previewGroup) previewGroup.remove();
        
        // Get the SVG content
        const serializer = new XMLSerializer();
        return serializer.serializeToString(clone);
    }

    /**
     * Import shapes from an array
     * @param {Array} shapes - Array of shape objects
     */
    importShapes(shapes) {
        if (!Array.isArray(shapes)) return;
        
        this.clear();
        
        shapes.forEach(shapeData => {
            let shape;
            
            if (shapeData.type === 'line') {
                shape = Line.fromObject(shapeData);
            } else if (shapeData.type === 'rectangle') {
                shape = Rectangle.fromObject(shapeData);
            } else if (shapeData.type === 'circle') {
                shape = Circle.fromObject(shapeData);
            } else if (shapeData.type === 'arc') {
                shape = Arc.fromObject(shapeData);
            }
            
            if (shape) {
                this.shapes.push(shape);
            }
        });
        
        this.render();
        
        logger.info(`Imported ${shapes.length} shapes`);
    }

    /**
     * Set grid visibility
     * @param {boolean} visible - Whether the grid should be visible
     */
    setGridVisible(visible) {
        this.gridVisible = visible;
        this.drawGrid();
        logger.info(`Grid visibility set to ${visible ? 'visible' : 'hidden'}`);
    }

    /**
     * Get a snapshot of the current shapes
     * @returns {Array} - A deep copy of the shapes array
     */
    getShapesSnapshot() {
        return JSON.parse(JSON.stringify(this.shapes));
    }

    /**
     * Restore shapes from a snapshot
     * @param {Array} shapesSnapshot - The shapes snapshot to restore
     */
    restoreShapesFromSnapshot(shapesSnapshot) {
        if (!Array.isArray(shapesSnapshot)) {
            logger.error('Invalid shapes snapshot');
            return;
        }
        
        this.shapes = shapesSnapshot;
        this.render();
        
        logger.info('Shapes restored from snapshot');
    }

    /**
     * Clear all shapes from the canvas
     */
    clearShapes() {
        this.shapes = [];
        this.selectedElements = [];
        this.render();
        
        logger.info('All shapes cleared');
    }
}

// Create a singleton instance
const canvasManager = new CanvasManager();

// Make canvasManager available globally
window.canvasManager = canvasManager; 