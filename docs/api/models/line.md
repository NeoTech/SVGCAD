# Line

The `Line` class represents a line segment in the CAD system, defined by two points. It provides methods for manipulation, measurement, and rendering.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `startPoint` | Point | The starting point of the line |
| `endPoint` | Point | The ending point of the line |
| `id` | String | Unique identifier for the line |
| `selected` | Boolean | Whether the line is currently selected |
| `style` | Object | Visual styling properties |

## Methods

### Constructor

```javascript
constructor(startPoint, endPoint, id = null)
```

Creates a new Line instance.

**Parameters:**
- `startPoint` (Point): The starting point
- `endPoint` (Point): The ending point
- `id` (String, optional): Unique identifier. If not provided, one will be generated.

### getLength()

```javascript
getLength()
```

Calculates the length of the line segment.

**Returns:**
- (Number): The length of the line

### getAngle()

```javascript
getAngle()
```

Calculates the angle of the line relative to the positive x-axis.

**Returns:**
- (Number): The angle in radians

### getMidpoint()

```javascript
getMidpoint()
```

Calculates the midpoint of the line segment.

**Returns:**
- (Point): A new Point instance at the line's midpoint

### move(dx, dy)

```javascript
move(dx, dy)
```

Moves the entire line by the specified delta values.

**Parameters:**
- `dx` (Number): Change in x-coordinate
- `dy` (Number): Change in y-coordinate

### rotate(center, angle)

```javascript
rotate(center, angle)
```

Rotates the line around a specified center point.

**Parameters:**
- `center` (Point): The center of rotation
- `angle` (Number): The rotation angle in radians

### intersectsWith(line)

```javascript
intersectsWith(line)
```

Checks if this line intersects with another line segment.

**Parameters:**
- `line` (Line): The line to check intersection with

**Returns:**
- (Object|null): Intersection point and parameters, or null if no intersection

### clone()

```javascript
clone()
```

Creates a deep copy of the line.

**Returns:**
- (Line): A new Line instance with the same properties

### render(svg)

```javascript
render(svg)
```

Renders the line on the SVG canvas.

**Parameters:**
- `svg` (SVGElement): The SVG element to render on

### hitTest(x, y, tolerance)

```javascript
hitTest(x, y, tolerance)
```

Tests if a coordinate is near the line segment.

**Parameters:**
- `x` (Number): The x-coordinate to test
- `y` (Number): The y-coordinate to test
- `tolerance` (Number): The hit test tolerance in pixels

**Returns:**
- (Boolean): True if the coordinate is within the hit area

## Events

The Line class emits the following events:

| Event | Description |
|-------|-------------|
| `moved` | Fired when the line is moved |
| `rotated` | Fired when the line is rotated |
| `selected` | Fired when the line is selected |
| `deselected` | Fired when the line is deselected |
| `modified` | Fired when either endpoint is modified |

## Example Usage

```javascript
// Create points
const start = new Point(100, 100);
const end = new Point(200, 200);

// Create a new line
const line = new Line(start, end);

// Get line properties
const length = line.getLength();
const angle = line.getAngle();
const midpoint = line.getMidpoint();

// Manipulate the line
line.move(10, 20);
line.rotate(midpoint, Math.PI / 4);

// Check intersection with another line
const line2 = new Line(new Point(150, 100), new Point(150, 300));
const intersection = line.intersectsWith(line2);
```

## Related Components

- Uses `Point` for endpoints
- Used by `ConstraintManager` for geometric constraints
- Used by drawing tools for creation and manipulation
- Used by selection tools for hit testing

## Implementation Details

The Line class implements the following interfaces:
- `IModel` - Basic model interface
- `ISelectable` - Selection handling
- `IRenderable` - SVG rendering
- `ISerializable` - Serialization support
- `ITransformable` - Geometric transformations

Lines are rendered on the SVG canvas with the following visual properties:
- Normal state: 1px width, black stroke
- Selected state: 2px width, blue stroke
- Hover state: 1.5px width, gray stroke

### Performance Considerations

- Caches calculated values (length, angle) until endpoints change
- Uses efficient line-point distance calculation for hit testing
- Implements optimized intersection testing algorithm 