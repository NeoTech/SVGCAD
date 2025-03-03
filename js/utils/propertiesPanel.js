/**
 * Properties Panel for the CAD Editor
 * Displays and allows editing of shape properties when a shape is selected
 */

class PropertiesPanel {
    /**
     * Create a new PropertiesPanel
     * @param {CanvasManager} canvasManager - The canvas manager instance
     */
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.panel = document.getElementById('property-panel');
        this.contentContainer = document.querySelector('.property-content');
        this.selectedShape = null;
        this.originalValues = {};
        
        // Bind methods
        this.showProperties = this.showProperties.bind(this);
        this.hideProperties = this.hideProperties.bind(this);
        this.updateProperties = this.updateProperties.bind(this);
        this.createPropertiesForm = this.createPropertiesForm.bind(this);
        this.applyChanges = this.applyChanges.bind(this);
    }

    /**
     * Show properties for the selected shape
     * @param {Object} shape - The selected shape
     */
    showProperties(shape) {
        this.selectedShape = shape;
        this.originalValues = this.getShapeValues(shape);
        this.createPropertiesForm(shape);
    }

    /**
     * Hide the properties panel
     */
    hideProperties() {
        this.selectedShape = null;
        this.originalValues = {};
        this.contentContainer.innerHTML = '<p>Select an element to view and edit its properties.</p>';
    }

    /**
     * Update properties when shape changes
     * @param {Object} shape - The updated shape
     */
    updateProperties(shape) {
        if (this.selectedShape && this.selectedShape.id === shape.id) {
            this.selectedShape = shape;
            this.createPropertiesForm(shape);
        }
    }

    /**
     * Get the current values of a shape
     * @param {Object} shape - The shape to get values from
     * @returns {Object} The shape values
     */
    getShapeValues(shape) {
        const values = {};
        
        switch (shape.type) {
            case 'line':
                values.x1 = shape.x1;
                values.y1 = shape.y1;
                values.x2 = shape.x2;
                values.y2 = shape.y2;
                values.length = shape.getLength();
                values.angle = shape.getAngleDegrees();
                break;
                
            case 'rectangle':
                values.x = shape.x;
                values.y = shape.y;
                values.width = shape.width;
                values.height = shape.height;
                values.area = shape.getArea();
                values.perimeter = shape.getPerimeter();
                break;
                
            case 'circle':
                values.cx = shape.cx;
                values.cy = shape.cy;
                values.radius = shape.radius;
                values.diameter = shape.radius * 2;
                values.area = shape.getArea();
                values.circumference = shape.getCircumference();
                break;
                
            case 'arc':
                values.cx = shape.cx;
                values.cy = shape.cy;
                values.radius = shape.radius;
                values.startAngle = shape.startAngle * (180 / Math.PI);
                values.endAngle = shape.endAngle * (180 / Math.PI);
                values.arcLength = shape.getArcLength ? shape.getArcLength() : 0;
                break;
        }
        
        return values;
    }

    /**
     * Create the properties form for a shape
     * @param {Object} shape - The shape to create properties for
     */
    createPropertiesForm(shape) {
        if (!shape) return;
        
        const formContainer = document.createElement('div');
        formContainer.className = 'properties-form';
        
        // Create form title
        const title = document.createElement('h4');
        title.textContent = `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} Properties`;
        formContainer.appendChild(title);
        
        // Create form fields based on shape type
        const fields = this.createFormFields(shape);
        fields.forEach(field => {
            formContainer.appendChild(field);
        });
        
        // Create buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.className = 'apply-button';
        applyButton.addEventListener('click', () => this.applyChanges(shape));
        
        buttonContainer.appendChild(applyButton);
        formContainer.appendChild(buttonContainer);
        
        // Update the content container
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(formContainer);
    }

    /**
     * Create form fields for a shape
     * @param {Object} shape - The shape to create fields for
     * @returns {Array} Array of form field elements
     */
    createFormFields(shape) {
        const fields = [];
        
        switch (shape.type) {
            case 'line':
                // Position fields
                fields.push(this.createFieldGroup('Start Point', [
                    this.createInputField('x1', 'X1', shape.x1, 'number', true),
                    this.createInputField('y1', 'Y1', shape.y1, 'number', true)
                ]));
                
                fields.push(this.createFieldGroup('End Point', [
                    this.createInputField('x2', 'X2', shape.x2, 'number', true),
                    this.createInputField('y2', 'Y2', shape.y2, 'number', true)
                ]));
                
                // Dimension fields
                fields.push(this.createFieldGroup('Dimensions', [
                    this.createInputField('length', 'Length', shape.getLength().toFixed(2), 'number', true),
                    this.createInputField('angle', 'Angle (°)', shape.getAngleDegrees().toFixed(2), 'number', true)
                ]));
                break;
                
            case 'rectangle':
                // Position fields
                fields.push(this.createFieldGroup('Position', [
                    this.createInputField('x', 'X', shape.x, 'number', true),
                    this.createInputField('y', 'Y', shape.y, 'number', true)
                ]));
                
                // Dimension fields
                fields.push(this.createFieldGroup('Dimensions', [
                    this.createInputField('width', 'Width', shape.width, 'number', true),
                    this.createInputField('height', 'Height', shape.height, 'number', true)
                ]));
                
                // Calculated fields
                fields.push(this.createFieldGroup('Calculated', [
                    this.createInputField('area', 'Area', shape.getArea().toFixed(2), 'number', false),
                    this.createInputField('perimeter', 'Perimeter', shape.getPerimeter().toFixed(2), 'number', false)
                ]));
                break;
                
            case 'circle':
                // Position fields
                fields.push(this.createFieldGroup('Center', [
                    this.createInputField('cx', 'X', shape.cx, 'number', true),
                    this.createInputField('cy', 'Y', shape.cy, 'number', true)
                ]));
                
                // Dimension fields
                fields.push(this.createFieldGroup('Dimensions', [
                    this.createInputField('radius', 'Radius', shape.radius, 'number', true),
                    this.createInputField('diameter', 'Diameter', shape.radius * 2, 'number', true)
                ]));
                
                // Calculated fields
                fields.push(this.createFieldGroup('Calculated', [
                    this.createInputField('area', 'Area', shape.getArea().toFixed(2), 'number', false),
                    this.createInputField('circumference', 'Circumference', shape.getCircumference().toFixed(2), 'number', false)
                ]));
                break;
                
            case 'arc':
                // Position fields
                fields.push(this.createFieldGroup('Center', [
                    this.createInputField('cx', 'X', shape.cx, 'number', true),
                    this.createInputField('cy', 'Y', shape.cy, 'number', true)
                ]));
                
                // Dimension fields
                fields.push(this.createFieldGroup('Dimensions', [
                    this.createInputField('radius', 'Radius', shape.radius, 'number', true),
                    this.createInputField('startAngle', 'Start Angle (°)', (shape.startAngle * (180 / Math.PI)).toFixed(2), 'number', true),
                    this.createInputField('endAngle', 'End Angle (°)', (shape.endAngle * (180 / Math.PI)).toFixed(2), 'number', true)
                ]));
                
                // Calculated fields
                const arcLength = shape.getArcLength ? shape.getArcLength().toFixed(2) : '0.00';
                fields.push(this.createFieldGroup('Calculated', [
                    this.createInputField('arcLength', 'Arc Length', arcLength, 'number', false)
                ]));
                break;
        }
        
        return fields;
    }

    /**
     * Create a field group
     * @param {string} title - The group title
     * @param {Array} fields - Array of field elements
     * @returns {HTMLElement} The field group element
     */
    createFieldGroup(title, fields) {
        const group = document.createElement('div');
        group.className = 'field-group';
        
        const groupTitle = document.createElement('h5');
        groupTitle.textContent = title;
        group.appendChild(groupTitle);
        
        fields.forEach(field => {
            group.appendChild(field);
        });
        
        return group;
    }

    /**
     * Create an input field
     * @param {string} name - The field name
     * @param {string} label - The field label
     * @param {*} value - The field value
     * @param {string} type - The input type
     * @param {boolean} editable - Whether the field is editable
     * @returns {HTMLElement} The input field element
     */
    createInputField(name, label, value, type, editable) {
        const field = document.createElement('div');
        field.className = 'input-field';
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.htmlFor = `property-${name}`;
        
        const input = document.createElement('input');
        input.type = type;
        input.id = `property-${name}`;
        input.name = name;
        
        // Format numeric values to 2 decimal places
        if (type === 'number' && typeof value === 'number') {
            input.value = value.toFixed(2);
            input.step = '0.01';
        } else {
            input.value = value;
        }
        
        input.disabled = !editable;
        
        // Add event listeners for real-time preview
        if (editable) {
            input.addEventListener('input', () => {
                // For number inputs, ensure only 2 decimal places
                if (input.type === 'number') {
                    const value = parseFloat(input.value);
                    if (!isNaN(value)) {
                        const decimalParts = input.value.split('.');
                        if (decimalParts.length > 1 && decimalParts[1].length > 2) {
                            input.value = value.toFixed(2);
                        }
                    }
                }
                this.previewChanges();
            });
        }
        
        field.appendChild(labelElement);
        field.appendChild(input);
        
        return field;
    }

    /**
     * Preview changes in real-time
     */
    previewChanges() {
        if (!this.selectedShape) return;
        
        const formData = this.getFormData();
        const updatedShape = this.createUpdatedShape(this.selectedShape, formData);
        
        if (updatedShape) {
            this.canvasManager.previewUpdatedShape(updatedShape);
        }
    }

    /**
     * Apply changes to the shape
     * @param {Object} shape - The shape to update
     */
    applyChanges(shape) {
        if (!shape) return;
        
        const formData = this.getFormData();
        const updatedShape = this.createUpdatedShape(shape, formData);
        
        if (updatedShape) {
            this.canvasManager.updateShape(updatedShape);
            
            // Deselect the shape after applying changes
            this.canvasManager.deselectAll();
            this.selectedShape = null;
            this.hideProperties();
            
            logger.info(`Updated ${shape.type} properties`);
        }
    }

    /**
     * Get form data from the properties form
     * @returns {Object} The form data
     */
    getFormData() {
        const formData = {};
        const inputs = this.contentContainer.querySelectorAll('input:not([disabled])');
        
        inputs.forEach(input => {
            const name = input.name;
            let value;
            
            if (input.type === 'number') {
                value = parseFloat(input.value);
                // Round to 2 decimal places
                if (!isNaN(value)) {
                    value = Math.round(value * 100) / 100;
                }
            } else {
                value = input.value;
            }
            
            if (!isNaN(value)) {
                formData[name] = value;
            }
        });
        
        return formData;
    }

    /**
     * Create an updated shape with new properties
     * @param {Object} shape - The original shape
     * @param {Object} formData - The form data with new values
     * @returns {Object} The updated shape
     */
    createUpdatedShape(shape, formData) {
        // Create a copy of the shape properties
        const shapeProps = { ...shape };
        
        // Apply form data updates
        switch (shape.type) {
            case 'line':
                // Handle direct property updates
                if (formData.x1 !== undefined) shapeProps.x1 = formData.x1;
                if (formData.y1 !== undefined) shapeProps.y1 = formData.y1;
                if (formData.x2 !== undefined) shapeProps.x2 = formData.x2;
                if (formData.y2 !== undefined) shapeProps.y2 = formData.y2;
                
                // Handle length and angle updates
                if (formData.length !== undefined || formData.angle !== undefined) {
                    const length = formData.length !== undefined ? formData.length : shape.getLength();
                    const angle = formData.angle !== undefined ? formData.angle * (Math.PI / 180) : shape.getAngle();
                    
                    // Keep the start point fixed and update the end point
                    shapeProps.x2 = shapeProps.x1 + length * Math.cos(angle);
                    shapeProps.y2 = shapeProps.y1 + length * Math.sin(angle);
                }
                
                // Create a new Line instance
                const updatedLine = new Line(shapeProps.x1, shapeProps.y1, shapeProps.x2, shapeProps.y2);
                updatedLine.id = shape.id;
                return updatedLine;
                
            case 'rectangle':
                // Handle direct property updates
                if (formData.x !== undefined) shapeProps.x = formData.x;
                if (formData.y !== undefined) shapeProps.y = formData.y;
                if (formData.width !== undefined) shapeProps.width = formData.width;
                if (formData.height !== undefined) shapeProps.height = formData.height;
                
                // Create a new Rectangle instance
                const updatedRect = new Rectangle(shapeProps.x, shapeProps.y, shapeProps.width, shapeProps.height);
                updatedRect.id = shape.id;
                return updatedRect;
                
            case 'circle':
                // Handle direct property updates
                if (formData.cx !== undefined) shapeProps.cx = formData.cx;
                if (formData.cy !== undefined) shapeProps.cy = formData.cy;
                
                // Handle radius or diameter updates
                if (formData.radius !== undefined) {
                    shapeProps.radius = formData.radius;
                } else if (formData.diameter !== undefined) {
                    shapeProps.radius = formData.diameter / 2;
                }
                
                // Create a new Circle instance
                const updatedCircle = new Circle(shapeProps.cx, shapeProps.cy, shapeProps.radius);
                updatedCircle.id = shape.id;
                return updatedCircle;
                
            case 'arc':
                // Handle direct property updates
                if (formData.cx !== undefined) shapeProps.cx = formData.cx;
                if (formData.cy !== undefined) shapeProps.cy = formData.cy;
                if (formData.radius !== undefined) shapeProps.radius = formData.radius;
                
                // Handle angle updates (convert from degrees to radians)
                if (formData.startAngle !== undefined) {
                    shapeProps.startAngle = formData.startAngle * (Math.PI / 180);
                }
                if (formData.endAngle !== undefined) {
                    shapeProps.endAngle = formData.endAngle * (Math.PI / 180);
                }
                
                // Create a new Arc instance
                const updatedArc = new Arc(
                    shapeProps.cx, 
                    shapeProps.cy, 
                    shapeProps.radius, 
                    shapeProps.startAngle, 
                    shapeProps.endAngle
                );
                updatedArc.id = shape.id;
                return updatedArc;
                
            default:
                return shape;
        }
    }
}

// Make PropertiesPanel available globally
window.PropertiesPanel = PropertiesPanel; 