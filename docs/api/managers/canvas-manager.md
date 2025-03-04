# Canvas Manager

The `CanvasManager` class is responsible for managing the SVG canvas, handling rendering, and managing geometric models. It serves as the central coordinator for all drawing operations.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `svgCanvas` | SVGElement | The main SVG canvas element |
| `overlay` | HTMLElement | The canvas overlay for temporary visuals |
| `models` | Array<Model> | Collection of all geometric models |
| `selectedModels` | Array<Model> | Currently selected models |
| `viewBox` | Object | Current view parameters (x, y, width, height) |
| `zoom` | Number | Current zoom level |
| `gridSize` | Number | Size of the grid cells |
| `gridVisible` | Boolean | Whether the grid is visible |

## Methods

### Constructor

```javascript
constructor(svgCanvas, overlay)
```

Creates a new CanvasManager instance.

**Parameters:**
- `svgCanvas` (SVGElement): The SVG canvas element
- `overlay` (HTMLElement): The canvas overlay element

### initialize()

```javascript
initialize()
```

Initializes the canvas manager and sets up event handlers.

### addModel(model)

```javascript
addModel(model)
```

Adds a model to the canvas.

**Parameters:**
- `model` (Model): The model to add

### removeModel(model)

```javascript
removeModel(model)
```

Removes a model from the canvas.

**Parameters:**
- `model` (Model): The model to remove

### selectModel(model, addToSelection = false)

```javascript
selectModel(model, addToSelection = false)
```

Selects a model.

**Parameters:**
- `model` (Model): The model to select
- `addToSelection` (Boolean): Whether to add to existing selection

### clearSelection()

```javascript
clearSelection()
```

Clears the current selection.

### render()

```javascript
render()
```

Renders all models and the grid.

### setViewBox(x, y, width, height)

```javascript
setViewBox(x, y, width, height)
```

Sets the canvas view box.

**Parameters:**
- `x` (Number): Left coordinate
- `y` (Number): Top coordinate
- `width` (Number): View width
- `height` (Number): View height

### zoom(factor, center)

```javascript
zoom(factor, center)
```

Zooms the canvas view.

**Parameters:**
- `factor` (Number): Zoom factor
- `center` (Point): Zoom center point

### pan(dx, dy)

```javascript
pan(dx, dy)
```

Pans the canvas view.

**Parameters:**
- `dx` (Number): Horizontal pan amount
- `dy` (Number): Vertical pan amount

### screenToCanvas(x, y)

```javascript
screenToCanvas(x, y)
```

Converts screen coordinates to canvas coordinates.

**Parameters:**
- `x` (Number): Screen x-coordinate
- `y` (Number): Screen y-coordinate

**Returns:**
- (Point): Canvas coordinates

### canvasToScreen(x, y)

```javascript
canvasToScreen(x, y)
```

Converts canvas coordinates to screen coordinates.

**Parameters:**
- `x` (Number): Canvas x-coordinate
- `y` (Number): Canvas y-coordinate

**Returns:**
- (Point): Screen coordinates

### findModelAt(x, y, tolerance)

```javascript
findModelAt(x, y, tolerance)
```

Finds a model at the specified coordinates.

**Parameters:**
- `x` (Number): X-coordinate
- `y` (Number): Y-coordinate
- `tolerance` (Number): Hit test tolerance

**Returns:**
- (Model|null): The found model or null

### findModelsInRect(x1, y1, x2, y2)

```javascript
findModelsInRect(x1, y1, x2, y2)
```

Finds all models within a rectangle.

**Parameters:**
- `x1` (Number): Left coordinate
- `y1` (Number): Top coordinate
- `x2` (Number): Right coordinate
- `y2` (Number): Bottom coordinate

**Returns:**
- (Array<Model>): Array of found models

### setGridSize(size)

```javascript
setGridSize(size)
```

Sets the grid size.

**Parameters:**
- `size` (Number): Grid cell size

### toggleGrid()

```javascript
toggleGrid()
```

Toggles grid visibility.

### exportSVG()

```javascript
exportSVG()
```

Exports the canvas as SVG.

**Returns:**
- (String): SVG content

## Events

The CanvasManager emits the following events:

| Event | Description |
|-------|-------------|
| `modelAdded` | Fired when a model is added |
| `modelRemoved` | Fired when a model is removed |
| `selectionChanged` | Fired when the selection changes |
| `viewChanged` | Fired when the view changes |
| `gridChanged` | Fired when grid properties change |

## Example Usage

```javascript
// Create canvas manager
const svgCanvas = document.getElementById('svg-canvas');
const overlay = document.getElementById('canvas-overlay');
const canvasManager = new CanvasManager(svgCanvas, overlay);

// Initialize
canvasManager.initialize();

// Add models
const point = new Point(100, 100);
canvasManager.addModel(point);

// Handle selection
canvasManager.on('selectionChanged', (selection) => {
    console.log('Selected models:', selection);
});

// Zoom and pan
canvasManager.zoom(1.5, new Point(400, 300));
canvasManager.pan(100, 50);

// Export
const svg = canvasManager.exportSVG();
```

## Related Components

- Used by all drawing tools
- Uses geometric models (Point, Line, Circle, etc.)
- Used by ConstraintManager for model access
- Used by AppStateManager for state management

## Implementation Details

### Rendering Pipeline
1. Clear canvas
2. Draw grid (if visible)
3. Draw all models
4. Draw selection indicators
5. Draw temporary visuals

### Selection Management
- Maintains selection set
- Handles multi-selection with modifier keys
- Provides selection rectangle functionality
- Manages selection highlighting

### View Management
- Maintains view transformation matrix
- Handles coordinate system conversions
- Manages zoom and pan operations
- Maintains aspect ratio

### Grid System
- Configurable grid size
- Snap-to-grid functionality
- Major/minor grid lines
- Grid visibility toggle

## Performance Considerations

1. **Rendering Optimization**
   - Uses requestAnimationFrame
   - Batches rendering operations
   - Implements dirty region tracking
   - Uses SVG clipping for large models

2. **Event Handling**
   - Debounces frequent events
   - Uses event delegation
   - Optimizes hit testing
   - Caches transformation matrices

3. **Memory Management**
   - Reuses SVG elements
   - Implements model pooling
   - Cleans up unused resources
   - Manages temporary objects

## Best Practices

1. **Model Management**
   ```javascript
   // Add models
   canvasManager.addModel(model);
   
   // Remove models
   canvasManager.removeModel(model);
   
   // Clear all
   canvasManager.models.forEach(m => canvasManager.removeModel(m));
   ```

2. **View Control**
   ```javascript
   // Fit content
   canvasManager.fitContent();
   
   // Set specific view
   canvasManager.setViewBox(0, 0, 1000, 1000);
   ```

3. **Selection**
   ```javascript
   // Single select
   canvasManager.selectModel(model);
   
   // Add to selection
   canvasManager.selectModel(model, true);
   
   // Clear selection
   canvasManager.clearSelection();
   ```
``` 