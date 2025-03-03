/**
 * Dimension Input Utility for the CAD Editor
 * Provides a floating input field for entering precise dimensions
 */
class DimensionInput {
    /**
     * Create a new DimensionInput
     * @param {CanvasManager} canvasManager - The Canvas Manager instance
     */
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.container = null;
        this.input = null;
        this.label = null;
        this.applyButton = null;
        this.currentTool = null;
        this.dimensionType = null; // 'length', 'width', 'radius', 'diameter', etc.
        this.callback = null;
        this.previewCallback = null; // Callback for real-time preview updates
        this.visible = false;
        this.position = { x: 0, y: 0 };
        this.inputTimeout = null;
        
        this.createInputElement();
    }
    
    /**
     * Create the input element
     */
    createInputElement() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'dimension-input-container';
        this.container.style.display = 'none';
        
        // Create label
        this.label = document.createElement('label');
        this.container.appendChild(this.label);
        
        // Create input
        this.input = document.createElement('input');
        this.input.type = 'number';
        this.input.step = '0.1';
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.container.appendChild(this.input);
        
        // Create apply button
        this.applyButton = document.createElement('button');
        this.applyButton.textContent = '✓';
        this.applyButton.addEventListener('click', this.applyValue.bind(this));
        this.container.appendChild(this.applyButton);
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    /**
     * Show the input field
     * @param {string} dimensionType - The type of dimension ('length', 'width', 'radius', etc.)
     * @param {number} initialValue - The initial value to show
     * @param {Object} position - The position {x, y} in screen coordinates
     * @param {Function} callback - The callback function to call when value is applied
     * @param {Object} tool - The tool that is using this input
     * @param {Function} previewCallback - Optional callback for real-time preview updates
     */
    show(dimensionType, initialValue, position, callback, tool, previewCallback) {
        this.dimensionType = dimensionType;
        this.callback = callback;
        this.previewCallback = previewCallback;
        this.currentTool = tool;
        this.position = position;
        
        // Set label based on dimension type
        this.label.textContent = this.getLabelText(dimensionType);
        
        // Set initial value
        this.input.value = initialValue.toFixed(2);
        
        // Position the input
        this.updatePosition();
        
        // Show the input
        this.container.style.display = 'flex';
        this.visible = true;
        
        // Focus the input
        this.input.focus();
        this.input.select();
    }
    
    /**
     * Hide the input field
     */
    hide() {
        this.container.style.display = 'none';
        this.visible = false;
        this.currentTool = null;
        this.callback = null;
        this.previewCallback = null;
        
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
            this.inputTimeout = null;
        }
    }
    
    /**
     * Update the position of the input field
     * @param {Object} position - Optional new position {x, y} in screen coordinates
     */
    updatePosition(position) {
        if (position) {
            this.position = position;
        }
        
        // Position the input near the cursor but not under it
        this.container.style.left = `${this.position.x + 20}px`;
        this.container.style.top = `${this.position.y - 10}px`;
    }
    
    /**
     * Apply the entered value
     */
    applyValue() {
        if (!this.visible || !this.callback) return;
        
        const value = parseFloat(this.input.value);
        if (isNaN(value) || value <= 0) {
            // Flash the input to indicate invalid value
            this.input.style.backgroundColor = '#ffdddd';
            setTimeout(() => {
                this.input.style.backgroundColor = '';
            }, 200);
            return;
        }
        
        // Call the callback with the value
        this.callback(value);
        
        // Hide the input
        this.hide();
    }
    
    /**
     * Handle input events for real-time preview
     * @param {Event} event - The input event
     */
    handleInput(event) {
        if (!this.visible || !this.previewCallback) return;
        
        const value = parseFloat(this.input.value);
        if (isNaN(value) || value <= 0) return;
        
        // Debounce the preview update to avoid too many updates
        if (this.inputTimeout) {
            clearTimeout(this.inputTimeout);
        }
        
        this.inputTimeout = setTimeout(() => {
            // Call the preview callback with the value
            this.previewCallback(value, this.dimensionType);
        }, 50); // 50ms debounce
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - The key event
     */
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.applyValue();
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.hide();
            event.preventDefault();
        } else if (event.key === 'Tab') {
            // Allow tabbing between multiple inputs if implemented
            event.preventDefault();
            if (this.currentTool && typeof this.currentTool.tabDimensionInput === 'function') {
                this.currentTool.tabDimensionInput();
            }
        }
    }
    
    /**
     * Get the label text based on dimension type
     * @param {string} dimensionType - The type of dimension
     * @returns {string} The label text
     */
    getLabelText(dimensionType) {
        switch (dimensionType) {
            case 'length':
                return 'Length:';
            case 'width':
                return 'Width:';
            case 'height':
                return 'Height:';
            case 'radius':
                return 'Radius:';
            case 'diameter':
                return 'Diameter:';
            case 'angle':
                return 'Angle:';
            default:
                return 'Value:';
        }
    }
    
    /**
     * Update the input value
     * @param {number} value - The new value
     */
    updateValue(value) {
        if (!this.visible) return;
        this.input.value = value.toFixed(2);
    }
    
    /**
     * Check if the input is visible
     * @returns {boolean} True if visible
     */
    isVisible() {
        return this.visible;
    }
}

// Make DimensionInput available globally
window.DimensionInput = DimensionInput; 