# Rectangle

The `Rectangle` class represents a rectangle in the CAD system, defined by a top-left corner point, width, and height. It provides methods for manipulation, measurement, and rendering.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `topLeft` | Point | The top-left corner point of the rectangle |
| `width` | Number | The width of the rectangle |
| `height` | Number | The height of the rectangle |
| `rotation` | Number | The rotation angle in radians |
| `id` | String | Unique identifier for the rectangle |
| `selected` | Boolean | Whether the rectangle is currently selected |
| `style` | Object | Visual styling properties |

## Methods

### Constructor

```javascript
constructor(topLeft, width, height, rotation = 0, id = null)
```

Creates a new Rectangle instance.

**Parameters:**
- `topLeft` (Point): The top-left corner point
- `width` (Number): The width of the rectangle
- `height` (Number): The height of the rectangle
- `rotation` (Number, optional): The rotation angle in radians (default: 0)
- `id` (String, optional): Unique identifier. If not provided, one will be generated.

### getArea()

```javascript
getArea()
```

Calculates the area of the rectangle.

**Returns:**
- (Number): The area of the rectangle

### getPerimeter()

```javascript
getPerimeter()
```

Calculates the perimeter of the rectangle.

**Returns:**
- (Number): The perimeter of the rectangle

### getCenter()

```javascript
getCenter()
```

Gets the center point of the rectangle.

**Returns:**
- (Point): The center point

### getCorners()

```javascript
getCorners()
```

Gets all four corners of the rectangle.

**Returns:**
- (Array<Point>): Array of corner points [topLeft, topRight, bottomRight, bottomLeft]

### move(dx, dy)

```javascript
move(dx, dy)
```

Moves the rectangle by the specified delta values.

**Parameters:**
- `dx` (Number): Change in x-coordinate
- `dy` (Number): Change in y-coordinate

### rotate(center, angle)

```javascript
rotate(center, angle)
```

Rotates the rectangle around a specified center point.

**Parameters:**
- `center` (Point): The center of rotation
- `angle` (Number): The rotation angle in radians

### scale(factor)

```javascript
scale(factor)
```

Scales the rectangle by the specified factor.

**Parameters:**
- `factor` (Number): The scaling factor

### containsPoint(point)

```javascript
containsPoint(point)
```

Checks if a point lies within the rectangle.

**Parameters:**
- `point` (Point): The point to check

**Returns:**
- (Boolean): True if the point is inside the rectangle

### intersectsWith(rectangle)

```javascript
intersectsWith(rectangle)
```

Checks if this rectangle intersects with another rectangle.

**Parameters:**
- `rectangle` (Rectangle): The rectangle to check intersection with

**Returns:**
- (Boolean): True if the rectangles intersect

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

Creates a deep copy of the rectangle.

**Returns:**
- (Rectangle): A new Rectangle instance with the same properties

### render(svg)

```javascript
render(svg)
```

Renders the rectangle on the SVG canvas.

**Parameters:**
- `svg` (SVGElement): The SVG element to render on

### hitTest(x, y, tolerance)

```javascript
hitTest(x, y, tolerance)
```

Tests if a coordinate is near the rectangle's perimeter.

**Parameters:**
- `x` (Number): The x-coordinate to test
- `y` (Number): The y-coordinate to test
- `tolerance` (Number): The hit test tolerance in pixels

**Returns:**
- (Boolean): True if the coordinate is within the hit area

## Events

The Rectangle class emits the following events:

| Event | Description |
|-------|-------------|
| `moved` | Fired when the rectangle is moved |
| `rotated` | Fired when the rectangle is rotated |
| `scaled` | Fired when the rectangle is scaled |
| `selected` | Fired when the rectangle is selected |
| `deselected` | Fired when the rectangle is deselected |
| `modified` | Fired when any property is modified |

## Example Usage

```javascript
// Create a rectangle
const topLeft = new Point(100, 100);
const rectangle = new Rectangle(topLeft, 200, 150);

// Get rectangle properties
const area = rectangle.getArea();
const perimeter = rectangle.getPerimeter();
const center = rectangle.getCenter();
const corners = rectangle.getCorners();

// Manipulate the rectangle
rectangle.move(10, 20);
rectangle.rotate(center, Math.PI / 4);
rectangle.scale(1.5);

// Check point containment
const point = new Point(150, 150);
const isInside = rectangle.containsPoint(point);

// Check intersection with line
const line = new Line(new Point(0, 100), new Point(300, 100));
const intersections = rectangle.intersectsWithLine(line);
```

## Related Components

- Uses `Point` for corners and intersection points
- Used by `ConstraintManager` for geometric constraints
- Used by drawing tools for creation and manipulation
- Used by selection tools for hit testing

## Implementation Details

The Rectangle class implements the following interfaces:
- `IModel` - Basic model interface
- `ISelectable` - Selection handling
- `IRenderable` - SVG rendering
- `ISerializable` - Serialization support
- `ITransformable` - Geometric transformations

Rectangles are rendered on the SVG canvas with the following visual properties:
- Normal state: 1px width, black stroke, no fill
- Selected state: 2px width, blue stroke, light blue fill with 0.1 opacity
- Hover state: 1.5px width, gray stroke, light gray fill with 0.1 opacity

### Performance Considerations

- Caches calculated values (area, perimeter, corners) until properties change
- Uses efficient rectangle-point containment test
- Implements optimized rectangle-rectangle intersection test
- Uses matrix transformations for rotation
- Handles special cases for axis-aligned rectangles 