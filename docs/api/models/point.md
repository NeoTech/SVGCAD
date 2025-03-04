# Point

The `Point` class represents a 2D point in the CAD system. It is one of the fundamental geometric primitives and is used by other geometric entities.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | The x-coordinate of the point |
| `y` | Number | The y-coordinate of the point |
| `id` | String | Unique identifier for the point |
| `selected` | Boolean | Whether the point is currently selected |

## Methods

### Constructor

```javascript
constructor(x, y, id = null)
```

Creates a new Point instance.

**Parameters:**
- `x` (Number): The x-coordinate
- `y` (Number): The y-coordinate
- `id` (String, optional): Unique identifier. If not provided, one will be generated.

### move(dx, dy)

```javascript
move(dx, dy)
```

Moves the point by the specified delta values.

**Parameters:**
- `dx` (Number): Change in x-coordinate
- `dy` (Number): Change in y-coordinate

### distanceTo(point)

```javascript
distanceTo(point)
```

Calculates the Euclidean distance to another point.

**Parameters:**
- `point` (Point): The target point

**Returns:**
- (Number): The distance between the points

### clone()

```javascript
clone()
```

Creates a deep copy of the point.

**Returns:**
- (Point): A new Point instance with the same coordinates

### render(svg)

```javascript
render(svg)
```

Renders the point on the SVG canvas.

**Parameters:**
- `svg` (SVGElement): The SVG element to render on

### hitTest(x, y, tolerance)

```javascript
hitTest(x, y, tolerance)
```

Tests if a coordinate is within the point's hit area.

**Parameters:**
- `x` (Number): The x-coordinate to test
- `y` (Number): The y-coordinate to test
- `tolerance` (Number): The hit test tolerance in pixels

**Returns:**
- (Boolean): True if the coordinate is within the hit area

## Events

The Point class emits the following events:

| Event | Description |
|-------|-------------|
| `moved` | Fired when the point is moved |
| `selected` | Fired when the point is selected |
| `deselected` | Fired when the point is deselected |

## Example Usage

```javascript
// Create a new point
const point = new Point(100, 100);

// Move the point
point.move(10, 20);

// Calculate distance to another point
const point2 = new Point(200, 200);
const distance = point.distanceTo(point2);

// Clone the point
const pointCopy = point.clone();
```

## Related Components

- Used by `Line` for start and end points
- Used by `Circle` and `Arc` for center points
- Used by `Rectangle` for corner points
- Used by `ConstraintManager` for constraint solving

## Implementation Details

The Point class implements the following interfaces:
- `IModel` - Basic model interface
- `ISelectable` - Selection handling
- `IRenderable` - SVG rendering
- `ISerializable` - Serialization support

Points are rendered as small circles on the SVG canvas with the following visual properties:
- Normal state: 2px radius, black fill
- Selected state: 3px radius, blue fill
- Hover state: 2.5px radius, gray fill 