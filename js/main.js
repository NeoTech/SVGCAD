/**
 * Main JavaScript file for the CAD Editor
 * Initializes the application and sets up the components
 */

// Initialize Alpine.js data before DOM is fully loaded
document.addEventListener('alpine:init', () => {
    // Define Alpine.js data
    window.Alpine.data('appData', () => ({
        activeTool: '',
        statusHint: 'Ready',
        mousePosition: { x: 0, y: 0 },
        gridVisible: true,
        gridSize: 10,
        snapToGrid: true,
        snapToPoints: true,
        snapToLines: true,
        snapDistance: 10,
        maxUndoSteps: 50,
        autoSaveEnabled: true,
        canUndo: false,
        canRedo: false,
        debugMode: false,
        logs: [],
        
        // Methods
        activateTool(toolName) {
            if (window.appStateManager) {
                window.appStateManager.activateTool(toolName);
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        toggleGrid() {
            if (window.appStateManager) {
                window.appStateManager.toggleGrid();
            } else {
                this.gridVisible = !this.gridVisible;
                console.error('appStateManager not initialized');
            }
        },
        
        toggleSnapToGrid() {
            if (window.appStateManager) {
                window.appStateManager.toggleSnapToGrid();
            } else {
                this.snapToGrid = !this.snapToGrid;
                console.error('appStateManager not initialized');
            }
        },
        
        setGridSize() {
            if (window.appStateManager) {
                // Convert to number since x-model binds as string
                const size = parseInt(this.gridSize, 10);
                window.appStateManager.setGridSize(size);
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        setSnapDistance() {
            if (window.appStateManager) {
                // Convert to number since x-model binds as string
                const distance = parseInt(this.snapDistance, 10);
                window.appStateManager.setSnapDistance(distance);
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        toggleSnapToPoints() {
            if (window.appStateManager) {
                window.appStateManager.toggleSnapToPoints();
            } else {
                this.snapToPoints = !this.snapToPoints;
                console.error('appStateManager not initialized');
            }
        },
        
        toggleSnapToLines() {
            if (window.appStateManager) {
                window.appStateManager.toggleSnapToLines();
            } else {
                this.snapToLines = !this.snapToLines;
                console.error('appStateManager not initialized');
            }
        },
        
        toggleDebugMode() {
            if (window.appStateManager) {
                window.appStateManager.toggleDebugMode();
            } else {
                this.debugMode = !this.debugMode;
                console.error('appStateManager not initialized');
            }
        },
        
        undo() {
            if (window.appStateManager) {
                window.appStateManager.undo();
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        redo() {
            if (window.appStateManager) {
                window.appStateManager.redo();
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        setMaxUndoSteps() {
            if (window.appStateManager) {
                // Convert to number since x-model binds as string
                const steps = parseInt(this.maxUndoSteps, 10);
                window.appStateManager.setMaxUndoSteps(steps);
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        toggleAutoSave() {
            if (window.appStateManager) {
                window.appStateManager.toggleAutoSave(this.autoSaveEnabled);
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        clearCanvas() {
            if (window.appStateManager) {
                if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
                    window.appStateManager.clearCanvas();
                }
            } else {
                console.error('appStateManager not initialized');
            }
        },
        
        exportSVG() {
            if (window.appStateManager) {
                window.appStateManager.exportSVG();
            } else {
                console.error('appStateManager not initialized');
            }
        }
    }));
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    try {
        // Initialize logger first
        if (window.logger) {
            logger.info('Initializing CAD Editor...');
        } else {
            console.log('Initializing CAD Editor...');
            console.warn('Logger not initialized');
        }
        
        // Get canvas elements
        const svgCanvas = document.getElementById('svg-canvas');
        const canvasOverlay = document.getElementById('canvas-overlay');
        
        if (!svgCanvas || !canvasOverlay) {
            throw new Error('Canvas elements not found');
        }
        
        // Make Alpine.js data available globally
        window.appData = Alpine.store('appData');
        if (!window.appData) {
            // If store doesn't work, get the data from the element
            const appElement = document.querySelector('[x-data="appData"]');
            if (appElement) {
                window.appData = Alpine.$data(appElement);
            } else {
                console.warn('Could not initialize appData globally');
            }
        }
        
        // Initialize managers
        initManagers(svgCanvas, canvasOverlay);
        
        // Register tools
        registerTools();
        
        // Set default active tool
        if (window.appStateManager) {
            appStateManager.activateTool('select');
        }
        
        if (window.logger) {
            logger.info('CAD Editor initialized successfully');
        } else {
            console.log('CAD Editor initialized successfully');
        }
    } catch (error) {
        if (window.logger) {
            logger.error(`Failed to initialize CAD Editor: ${error.message}`);
        }
        console.error('Failed to initialize CAD Editor:', error);
    }
}

/**
 * Initialize managers
 * @param {SVGElement} svgCanvas - The SVG canvas element
 * @param {HTMLElement} canvasOverlay - The canvas overlay element
 */
function initManagers(svgCanvas, canvasOverlay) {
    // Create a simple app state object for initialization
    const initialAppState = {
        gridVisible: true,
        snapEnabled: true
    };
    
    // Initialize Canvas Manager
    if (window.canvasManager) {
        canvasManager.init(svgCanvas, canvasOverlay, initialAppState);
    } else {
        console.error('canvasManager not found');
    }
    
    // Initialize Constraint Manager
    if (window.constraintManager) {
        constraintManager.init(canvasManager);
    } else {
        console.error('constraintManager not found');
    }
    
    // Initialize App State Manager
    if (window.appStateManager) {
        appStateManager.init(canvasManager, constraintManager);
    } else {
        console.error('appStateManager not found');
    }
    
    // Update canvas size
    if (window.canvasManager) {
        canvasManager.updateCanvasSize();
    }
    
    if (window.logger) {
        logger.info('Managers initialized');
    } else {
        console.log('Managers initialized');
    }
}

/**
 * Register tools
 */
function registerTools() {
    if (!window.appStateManager) {
        console.error('appStateManager not found, cannot register tools');
        return;
    }
    
    // Register Select Tool
    if (window.selectTool) {
        appStateManager.registerTool(selectTool);
    } else {
        console.error('selectTool not found');
    }
    
    // Register Line Tool
    if (window.lineTool) {
        appStateManager.registerTool(lineTool);
    } else {
        console.error('lineTool not found');
    }
    
    // Register Rectangle Tool
    if (window.rectangleTool) {
        appStateManager.registerTool(rectangleTool);
    } else {
        console.error('rectangleTool not found');
    }
    
    // Register Circle Tool
    if (window.circleTool) {
        appStateManager.registerTool(circleTool);
    } else {
        console.error('circleTool not found');
    }
    
    // Register Arc Tool
    if (window.arcTool) {
        appStateManager.registerTool(arcTool);
    } else {
        console.error('arcTool not found');
    }
    
    if (window.logger) {
        logger.info('Tools registered');
    } else {
        console.log('Tools registered');
    }
}

/**
 * Handle window resize
 */
window.addEventListener('resize', () => {
    if (window.canvasManager) {
        canvasManager.updateCanvasSize();
    }
}); 