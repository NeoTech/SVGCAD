# Circle

The `Circle` class represents a circle in the CAD system, defined by a center point and radius. It provides methods for manipulation, measurement, and rendering.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `center` | Point | The center point of the circle |
| `radius` | Number | The radius of the circle |
| `id` | String | Unique identifier for the circle |
| `selected` | Boolean | Whether the circle is currently selected |
| `style` | Object | Visual styling properties |

## Methods

### Constructor

```javascript
constructor(center, radius, id = null)
```

Creates a new Circle instance.

**Parameters:**
- `center` (Point): The center point of the circle
- `radius` (Number): The radius of the circle
- `id` (String, optional): Unique identifier. If not provided, one will be generated.

### getArea()

```javascript
getArea()
```

Calculates the area of the circle.

**Returns:**
- (Number): The area of the circle

### getCircumference()

```javascript
getCircumference()
```

Calculates the circumference of the circle.

**Returns:**
- (Number): The circumference of the circle

### getPointAtAngle(angle)

```javascript
getPointAtAngle(angle)
```

Gets the point on the circle at a specified angle.

**Parameters:**
- `angle` (Number): The angle in radians from the positive x-axis

**Returns:**
- (Point): A point on the circle's circumference

### move(dx, dy)

```javascript
move(dx, dy)
```

Moves the circle by the specified delta values.

**Parameters:**
- `dx` (Number): Change in x-coordinate
- `dy` (Number): Change in y-coordinate

### scale(factor)

```javascript
scale(factor)
```

Scales the circle by the specified factor.

**Parameters:**
- `factor` (Number): The scaling factor

### intersectsWith(circle)

```javascript
intersectsWith(circle)
```

Finds intersection points with another circle.

**Parameters:**
- `circle` (Circle): The circle to check intersection with

**Returns:**
- (Array<Point>): Array of intersection points (0, 1, or 2 points)

### intersectsWithLine(line)

```javascript
intersectsWithLine(line)
```

Finds intersection points with a line.

**Parameters:**
- `line` (Line): The line to check intersection with

**Returns:**
- (Array<Point>): Array of intersection points (0, 1, or 2 points)

### clone()

```javascript
clone()
```

Creates a deep copy of the circle.

**Returns:**
- (Circle): A new Circle instance with the same properties

### render(svg)

```javascript
render(svg)
```

Renders the circle on the SVG canvas.

**Parameters:**
- `svg` (SVGElement): The SVG element to render on

### hitTest(x, y, tolerance)

```javascript
hitTest(x, y, tolerance)
```

Tests if a coordinate is near the circle's circumference.

**Parameters:**
- `x` (Number): The x-coordinate to test
- `y` (Number): The y-coordinate to test
- `tolerance` (Number): The hit test tolerance in pixels

**Returns:**
- (Boolean): True if the coordinate is within the hit area

## Events

The Circle class emits the following events:

| Event | Description |
|-------|-------------|
| `moved` | Fired when the circle is moved |
| `scaled` | Fired when the circle is scaled |
| `selected` | Fired when the circle is selected |
| `deselected` | Fired when the circle is deselected |
| `modified` | Fired when the center or radius is modified |

## Example Usage

```javascript
// Create a circle
const center = new Point(100, 100);
const circle = new Circle(center, 50);

// Get circle properties
const area = circle.getArea();
const circumference = circle.getCircumference();

// Get point on circle
const point = circle.getPointAtAngle(Math.PI / 4);

// Manipulate the circle
circle.move(10, 20);
circle.scale(1.5);

// Check intersection with another circle
const circle2 = new Circle(new Point(150, 100), 30);
const intersections = circle.intersectsWith(circle2);
```

## Related Components

- Uses `Point` for center and intersection points
- Used by `ConstraintManager` for geometric constraints
- Used by drawing tools for creation and manipulation
- Used by selection tools for hit testing

## Implementation Details

The Circle class implements the following interfaces:
- `IModel` - Basic model interface
- `ISelectable` - Selection handling
- `IRenderable` - SVG rendering
- `ISerializable` - Serialization support
- `ITransformable` - Geometric transformations

Circles are rendered on the SVG canvas with the following visual properties:
- Normal state: 1px width, black stroke, no fill
- Selected state: 2px width, blue stroke, light blue fill with 0.1 opacity
- Hover state: 1.5px width, gray stroke, light gray fill with 0.1 opacity

### Performance Considerations

- Caches calculated values (area, circumference) until radius changes
- Uses efficient circle-point distance calculation for hit testing
- Implements optimized circle-circle and circle-line intersection algorithms
- Uses quadratic equation solver for intersection calculations 