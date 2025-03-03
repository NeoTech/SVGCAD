/**
 * Application State Manager for the CAD Editor
 * Manages the overall state of the application
 */
class AppStateManager {
    /**
     * Create a new AppStateManager
     */
    constructor() {
        this.initialized = false;
        this.activeTool = null;
        this.tools = {};
        this.mousePosition = { x: 0, y: 0 };
        this.statusHint = 'Ready';
        this.gridVisible = true;
        this.snapToGrid = true;
        this.snapToPoints = true;
        this.snapToLines = true;
        this.debugMode = false;
        this.canvasManager = null;
        this.constraintManager = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
    }

    /**
     * Initialize the application state
     * @param {CanvasManager} canvasManager - The canvas manager
     * @param {ConstraintManager} constraintManager - The constraint manager
     */
    init(canvasManager, constraintManager) {
        if (this.initialized) {
            logger.warn('AppStateManager already initialized');
            return;
        }

        this.canvasManager = canvasManager;
        this.constraintManager = constraintManager;
        
        // Register event listeners
        this.registerEventListeners();
        
        // Connect logger to Alpine.js data
        this.connectLoggerToAlpine();
        
        this.initialized = true;
        logger.info('AppStateManager initialized');
    }

    /**
     * Connect logger to Alpine.js data
     */
    connectLoggerToAlpine() {
        if (window.logger) {
            try {
                logger.setLogCallback((entry) => {
                    if (window.appData && Array.isArray(window.appData.logs)) {
                        window.appData.logs.unshift(entry);
                        
                        // Limit the number of logs to display
                        if (window.appData.logs.length > 100) {
                            window.appData.logs.pop();
                        }
                    } else {
                        // If appData is not available, just log to console
                        console.log(`[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`);
                    }
                });
                logger.info('Logger connected to Alpine.js');
            } catch (error) {
                console.error('Failed to connect logger to Alpine.js:', error);
            }
        } else {
            console.warn('Logger not available, cannot connect to Alpine.js');
        }
    }

    /**
     * Register event listeners
     */
    registerEventListeners() {
        if (!this.canvasManager) return;
        
        const overlay = this.canvasManager.canvasOverlay;
        
        // Mouse events
        overlay.addEventListener('mousedown', this.handleMouseDown.bind(this));
        overlay.addEventListener('mousemove', this.handleMouseMove.bind(this));
        overlay.addEventListener('mouseup', this.handleMouseUp.bind(this));
        overlay.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        overlay.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        logger.info('Event listeners registered');
    }

    /**
     * Register a tool
     * @param {BaseTool} tool - The tool to register
     */
    registerTool(tool) {
        if (!tool || !tool.name) {
            logger.error('Cannot register tool: Invalid tool');
            return;
        }
        
        this.tools[tool.name] = tool;
        tool.init(this.canvasManager, this.constraintManager, this);
        
        logger.info(`Tool registered: ${tool.name}`);
    }

    /**
     * Activate a tool
     * @param {string} toolName - The name of the tool to activate
     */
    activateTool(toolName) {
        if (!this.tools[toolName]) {
            logger.error(`Cannot activate tool: Tool '${toolName}' not found`);
            return;
        }
        
        // Deactivate current tool
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        
        // Activate new tool
        this.activeTool = this.tools[toolName];
        this.activeTool.activate();
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.activeTool = toolName;
            window.appData.statusHint = this.activeTool.statusHint;
        } else {
            // If appData is not available, update our internal state
            this.statusHint = this.activeTool.statusHint;
            console.warn(`Tool activated: ${toolName}, but appData is not available`);
        }
        
        logger.info(`Tool activated: ${toolName}`);
    }

    /**
     * Toggle grid visibility
     */
    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        
        if (this.canvasManager) {
            this.canvasManager.setGridVisible(this.gridVisible);
        }
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.gridVisible = this.gridVisible;
        }
        
        logger.info(`Grid visibility: ${this.gridVisible ? 'On' : 'Off'}`);
    }

    /**
     * Toggle snap to grid
     */
    toggleSnapToGrid() {
        this.snapToGrid = !this.snapToGrid;
        
        if (this.constraintManager) {
            this.constraintManager.toggleConstraint('snapToGrid', this.snapToGrid);
        }
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.snapToGrid = this.snapToGrid;
        }
        
        logger.info(`Snap to grid: ${this.snapToGrid ? 'On' : 'Off'}`);
    }

    /**
     * Toggle snap to points
     */
    toggleSnapToPoints() {
        this.snapToPoints = !this.snapToPoints;
        
        if (this.constraintManager) {
            this.constraintManager.toggleConstraint('snapToPoints', this.snapToPoints);
        }
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.snapToPoints = this.snapToPoints;
        }
        
        logger.info(`Snap to points: ${this.snapToPoints ? 'On' : 'Off'}`);
    }

    /**
     * Toggle snap to lines
     */
    toggleSnapToLines() {
        this.snapToLines = !this.snapToLines;
        
        if (this.constraintManager) {
            this.constraintManager.toggleConstraint('snapToLines', this.snapToLines);
        }
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.snapToLines = this.snapToLines;
        }
        
        logger.info(`Snap to lines: ${this.snapToLines ? 'On' : 'Off'}`);
    }

    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        // Update Alpine.js data
        if (window.appData) {
            window.appData.debugMode = this.debugMode;
        }
        
        logger.info(`Debug mode: ${this.debugMode ? 'On' : 'Off'}`);
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseDown(event) {
        if (this.activeTool) {
            this.activeTool.onMouseDown(event);
        }
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseMove(event) {
        if (this.activeTool) {
            this.activeTool.onMouseMove(event);
        }
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseUp(event) {
        if (this.activeTool) {
            this.activeTool.onMouseUp(event);
        }
    }

    /**
     * Handle double click event
     * @param {MouseEvent} event - The mouse event
     */
    handleDoubleClick(event) {
        if (this.activeTool && typeof this.activeTool.onDoubleClick === 'function') {
            this.activeTool.onDoubleClick(event);
        }
    }

    /**
     * Handle context menu event
     * @param {MouseEvent} event - The mouse event
     */
    handleContextMenu(event) {
        if (this.activeTool && typeof this.activeTool.onContextMenu === 'function') {
            this.activeTool.onContextMenu(event);
        }
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        // Handle global shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'z':
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    event.preventDefault();
                    return;
                    
                case 'y':
                    this.redo();
                    event.preventDefault();
                    return;
                    
                case 's':
                    this.exportSVG();
                    event.preventDefault();
                    return;
            }
        }
        
        // Pass to active tool
        if (this.activeTool) {
            this.activeTool.onKeyDown(event);
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        if (this.activeTool) {
            this.activeTool.onKeyUp(event);
        }
    }

    /**
     * Handle window resize event
     */
    handleWindowResize() {
        if (this.canvasManager) {
            this.canvasManager.updateCanvasSize();
        }
    }

    /**
     * Push a state to the undo stack
     */
    pushUndoState() {
        if (!this.canvasManager) return;
        
        // Get current state
        const state = {
            shapes: this.canvasManager.getShapesSnapshot()
        };
        
        // Push to undo stack
        this.undoStack.push(state);
        
        // Clear redo stack
        this.redoStack = [];
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        logger.debug('Undo state saved');
    }

    /**
     * Undo the last action
     */
    undo() {
        if (this.undoStack.length === 0) {
            logger.info('Nothing to undo');
            return;
        }
        
        // Get current state for redo
        const currentState = {
            shapes: this.canvasManager.getShapesSnapshot()
        };
        
        // Push current state to redo stack
        this.redoStack.push(currentState);
        
        // Pop state from undo stack
        const state = this.undoStack.pop();
        
        // Apply state
        this.canvasManager.restoreShapesFromSnapshot(state.shapes);
        
        logger.info('Undo performed');
    }

    /**
     * Redo the last undone action
     */
    redo() {
        if (this.redoStack.length === 0) {
            logger.info('Nothing to redo');
            return;
        }
        
        // Get current state for undo
        const currentState = {
            shapes: this.canvasManager.getShapesSnapshot()
        };
        
        // Push current state to undo stack
        this.undoStack.push(currentState);
        
        // Pop state from redo stack
        const state = this.redoStack.pop();
        
        // Apply state
        this.canvasManager.restoreShapesFromSnapshot(state.shapes);
        
        logger.info('Redo performed');
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        if (!this.canvasManager) return;
        
        // Save current state for undo
        this.pushUndoState();
        
        // Clear canvas
        this.canvasManager.clearShapes();
        
        logger.info('Canvas cleared');
    }

    /**
     * Export the canvas as SVG
     */
    exportSVG() {
        if (!this.canvasManager) return;
        
        const svgContent = this.canvasManager.exportSVG();
        
        // Create a blob and download link
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cad-drawing.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        logger.info('SVG exported');
    }
}

// Create a singleton instance
const appStateManager = new AppStateManager();

// Make appStateManager available globally
window.appStateManager = appStateManager; 