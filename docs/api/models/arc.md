# Arc

The `Arc` class represents a circular arc in the CAD system, defined by a center point, radius, and start/end angles. It provides methods for manipulation, measurement, and rendering.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `center` | Point | The center point of the arc |
| `radius` | Number | The radius of the arc |
| `startAngle` | Number | The starting angle in radians |
| `endAngle` | Number | The ending angle in radians |
| `id` | String | Unique identifier for the arc |
| `selected` | Boolean | Whether the arc is currently selected |
| `style` | Object | Visual styling properties |

## Methods

### Constructor

```javascript
constructor(center, radius, startAngle, endAngle, id = null)
```

Creates a new Arc instance.

**Parameters:**
- `center` (Point): The center point of the arc
- `radius` (Number): The radius of the arc
- `startAngle` (Number): The starting angle in radians
- `endAngle` (Number): The ending angle in radians
- `id` (String, optional): Unique identifier. If not provided, one will be generated.

### getLength()

```javascript
getLength()
```

Calculates the length of the arc.

**Returns:**
- (Number): The length of the arc

### getArea()

```javascript
getArea()
```

Calculates the area of the sector defined by the arc.

**Returns:**
- (Number): The area of the arc sector

### getStartPoint()

```javascript
getStartPoint()
```

Gets the point where the arc begins.

**Returns:**
- (Point): The start point of the arc

### getEndPoint()

```javascript
getEndPoint()
```

Gets the point where the arc ends.

**Returns:**
- (Point): The end point of the arc

### getPointAtAngle(angle)

```javascript
getPointAtAngle(angle)
```

Gets a point on the arc at a specified angle.

**Parameters:**
- `angle` (Number): The angle in radians

**Returns:**
- (Point): A point on the arc, or null if the angle is outside the arc's range

### move(dx, dy)

```javascript
move(dx, dy)
```

Moves the arc by the specified delta values.

**Parameters:**
- `dx` (Number): Change in x-coordinate
- `dy` (Number): Change in y-coordinate

### rotate(center, angle)

```javascript
rotate(center, angle)
```

Rotates the arc around a specified center point.

**Parameters:**
- `center` (Point): The center of rotation
- `angle` (Number): The rotation angle in radians

### scale(factor)

```javascript
scale(factor)
```

Scales the arc by the specified factor.

**Parameters:**
- `factor` (Number): The scaling factor

### intersectsWith(arc)

```javascript
intersectsWith(arc)
```

Finds intersection points with another arc.

**Parameters:**
- `arc` (Arc): The arc to check intersection with

**Returns:**
- (Array<Point>): Array of intersection points

### intersectsWithLine(line)

```javascript
intersectsWithLine(line)
```

Finds intersection points with a line.

**Parameters:**
- `line` (Line): The line to check intersection with

**Returns:**
- (Array<Point>): Array of intersection points

### clone()

```javascript
clone()
```

Creates a deep copy of the arc.

**Returns:**
- (Arc): A new Arc instance with the same properties

### render(svg)

```javascript
render(svg)
```

Renders the arc on the SVG canvas.

**Parameters:**
- `svg` (SVGElement): The SVG element to render on

### hitTest(x, y, tolerance)

```javascript
hitTest(x, y, tolerance)
```

Tests if a coordinate is near the arc.

**Parameters:**
- `x` (Number): The x-coordinate to test
- `y` (Number): The y-coordinate to test
- `tolerance` (Number): The hit test tolerance in pixels

**Returns:**
- (Boolean): True if the coordinate is within the hit area

## Events

The Arc class emits the following events:

| Event | Description |
|-------|-------------|
| `moved` | Fired when the arc is moved |
| `rotated` | Fired when the arc is rotated |
| `scaled` | Fired when the arc is scaled |
| `selected` | Fired when the arc is selected |
| `deselected` | Fired when the arc is deselected |
| `modified` | Fired when any property is modified |

## Example Usage

```javascript
// Create an arc
const center = new Point(100, 100);
const arc = new Arc(center, 50, 0, Math.PI);

// Get arc properties
const length = arc.getLength();
const area = arc.getArea();
const startPoint = arc.getStartPoint();
const endPoint = arc.getEndPoint();

// Manipulate the arc
arc.move(10, 20);
arc.rotate(center, Math.PI / 4);
arc.scale(1.5);

// Check intersection with a line
const line = new Line(new Point(0, 100), new Point(200, 100));
const intersections = arc.intersectsWithLine(line);
```

## Related Components

- Uses `Point` for center and intersection points
- Used by `ConstraintManager` for geometric constraints
- Used by drawing tools for creation and manipulation
- Used by selection tools for hit testing

## Implementation Details

The Arc class implements the following interfaces:
- `IModel` - Basic model interface
- `ISelectable` - Selection handling
- `IRenderable` - SVG rendering
- `ISerializable` - Serialization support
- `ITransformable` - Geometric transformations

Arcs are rendered on the SVG canvas with the following visual properties:
- Normal state: 1px width, black stroke, no fill
- Selected state: 2px width, blue stroke, light blue fill with 0.1 opacity
- Hover state: 1.5px width, gray stroke, light gray fill with 0.1 opacity

### Performance Considerations

- Caches calculated values (length, area) until properties change
- Uses efficient arc-point distance calculation for hit testing
- Implements optimized arc-arc and arc-line intersection algorithms
- Uses SVG path commands for efficient rendering
- Handles special cases for full circles and small angles 