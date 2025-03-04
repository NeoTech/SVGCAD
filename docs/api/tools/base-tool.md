# BaseTool

The `BaseTool` class serves as the abstract base class for all drawing tools in the CAD system. It provides the common interface and functionality that all tools must implement.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | The unique name of the tool |
| `active` | Boolean | Whether the tool is currently active |
| `canvasManager` | CanvasManager | Reference to the canvas manager |
| `constraintManager` | ConstraintManager | Reference to the constraint manager |
| `cursor` | String | The CSS cursor style when tool is active |
| `statusHint` | String | The current status hint for the user |

## Methods

### Constructor

```javascript
constructor(name, canvasManager, constraintManager)
```

Creates a new BaseTool instance.

**Parameters:**
- `name` (String): The unique name of the tool
- `canvasManager` (CanvasManager): Reference to the canvas manager
- `constraintManager` (ConstraintManager): Reference to the constraint manager

### activate()

```javascript
activate()
```

Activates the tool. Called when the tool is selected.

### deactivate()

```javascript
deactivate()
```

Deactivates the tool. Called when another tool is selected.

### onMouseDown(event)

```javascript
onMouseDown(event)
```

Handles mouse down events.

**Parameters:**
- `event` (MouseEvent): The mouse event

### onMouseMove(event)

```javascript
onMouseMove(event)
```

Handles mouse move events.

**Parameters:**
- `event` (MouseEvent): The mouse event

### onMouseUp(event)

```javascript
onMouseUp(event)
```

Handles mouse up events.

**Parameters:**
- `event` (MouseEvent): The mouse event

### onKeyDown(event)

```javascript
onKeyDown(event)
```

Handles key down events.

**Parameters:**
- `event` (KeyboardEvent): The keyboard event

### onKeyUp(event)

```javascript
onKeyUp(event)
```

Handles key up events.

**Parameters:**
- `event` (KeyboardEvent): The keyboard event

### getMousePosition(event)

```javascript
getMousePosition(event)
```

Gets the mouse position in canvas coordinates.

**Parameters:**
- `event` (MouseEvent): The mouse event

**Returns:**
- (Point): The mouse position as a Point

### snapToGrid(point)

```javascript
snapToGrid(point)
```

Snaps a point to the grid if grid snapping is enabled.

**Parameters:**
- `point` (Point): The point to snap

**Returns:**
- (Point): The snapped point

### snapToPoints(point)

```javascript
snapToPoints(point)
```

Snaps a point to nearby points if point snapping is enabled.

**Parameters:**
- `point` (Point): The point to snap

**Returns:**
- (Point): The snapped point

### snapToLines(point)

```javascript
snapToLines(point)
```

Snaps a point to nearby lines if line snapping is enabled.

**Parameters:**
- `point` (Point): The point to snap

**Returns:**
- (Point): The snapped point

### setStatusHint(hint)

```javascript
setStatusHint(hint)
```

Sets the status hint text.

**Parameters:**
- `hint` (String): The status hint text

### setCursor(cursor)

```javascript
setCursor(cursor)
```

Sets the cursor style.

**Parameters:**
- `cursor` (String): The CSS cursor style

## Events

The BaseTool class emits the following events:

| Event | Description |
|-------|-------------|
| `activated` | Fired when the tool is activated |
| `deactivated` | Fired when the tool is deactivated |
| `statusHintChanged` | Fired when the status hint changes |

## Example Usage

```javascript
class MyTool extends BaseTool {
    constructor(canvasManager, constraintManager) {
        super('myTool', canvasManager, constraintManager);
        this.cursor = 'crosshair';
    }

    activate() {
        super.activate();
        this.setStatusHint('Click to use my tool');
    }

    onMouseDown(event) {
        const pos = this.getMousePosition(event);
        const snappedPos = this.snapToGrid(pos);
        // Tool-specific logic here
    }

    onMouseMove(event) {
        const pos = this.getMousePosition(event);
        // Tool-specific logic here
    }

    onMouseUp(event) {
        // Tool-specific logic here
    }
}
```

## Related Components

- Extended by all drawing tools
- Uses `CanvasManager` for rendering and model management
- Uses `ConstraintManager` for geometric constraints
- Uses `Point` for coordinate handling

## Implementation Details

The BaseTool class provides:

### Event Handling
- Mouse event coordinate transformation
- Event propagation control
- Modifier key state tracking

### Snapping Support
- Grid snapping with configurable size
- Point snapping with configurable radius
- Line snapping with configurable tolerance

### UI Feedback
- Status hint management
- Cursor style management
- Visual feedback helpers

### State Management
- Tool activation/deactivation
- Operation cancellation
- Temporary state cleanup

## Best Practices

When implementing a new tool:

1. Always call super methods when overriding:
   ```javascript
   activate() {
       super.activate();
       // Tool-specific activation
   }
   ```

2. Clean up temporary state in deactivate:
   ```javascript
   deactivate() {
       // Clean up tool state
       super.deactivate();
   }
   ```

3. Use status hints to guide users:
   ```javascript
   onMouseMove() {
       this.setStatusHint('Click to place point');
   }
   ```

4. Handle operation cancellation:
   ```javascript
   onKeyDown(event) {
       if (event.key === 'Escape') {
           this.cancelOperation();
       }
   }
   ```

5. Use appropriate cursor styles:
   ```javascript
   setCursor('crosshair'); // For drawing
   setCursor('move');      // For dragging
   setCursor('pointer');   // For selection
   ``` 