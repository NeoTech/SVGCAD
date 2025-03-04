# Constraint Manager

The `ConstraintManager` class manages geometric constraints between models in the CAD system. It handles constraint creation, validation, solving, and updates model positions to satisfy constraints.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `constraints` | Array<Constraint> | Collection of all active constraints |
| `canvasManager` | CanvasManager | Reference to the canvas manager |
| `solver` | ConstraintSolver | The geometric constraint solver |
| `enabled` | Boolean | Whether constraint solving is enabled |
| `debugMode` | Boolean | Whether debug mode is enabled |

## Methods

### Constructor

```javascript
constructor(canvasManager)
```

Creates a new ConstraintManager instance.

**Parameters:**
- `canvasManager` (CanvasManager): Reference to the canvas manager

### initialize()

```javascript
initialize()
```

Initializes the constraint manager and sets up event handlers.

### addConstraint(constraint)

```javascript
addConstraint(constraint)
```

Adds a geometric constraint.

**Parameters:**
- `constraint` (Constraint): The constraint to add

**Returns:**
- (Boolean): Whether the constraint was successfully added

### removeConstraint(constraint)

```javascript
removeConstraint(constraint)
```

Removes a geometric constraint.

**Parameters:**
- `constraint` (Constraint): The constraint to remove

### solve()

```javascript
solve()
```

Solves all active constraints.

**Returns:**
- (Boolean): Whether all constraints were satisfied

### validateConstraints()

```javascript
validateConstraints()
```

Validates all constraints for consistency.

**Returns:**
- (Array<Error>): Array of constraint validation errors

### getConstraintsForModel(model)

```javascript
getConstraintsForModel(model)
```

Gets all constraints affecting a model.

**Parameters:**
- `model` (Model): The model to check

**Returns:**
- (Array<Constraint>): Array of related constraints

### clearConstraints()

```javascript
clearConstraints()
```

Removes all constraints.

### toggleEnabled()

```javascript
toggleEnabled()
```

Toggles constraint solving on/off.

### setDebugMode(enabled)

```javascript
setDebugMode(enabled)
```

Sets debug mode for constraint solving.

**Parameters:**
- `enabled` (Boolean): Whether to enable debug mode

## Supported Constraints

The ConstraintManager supports various geometric constraints:

### 1. Distance Constraint
```javascript
new DistanceConstraint(point1, point2, distance)
```
Maintains a fixed distance between two points.

### 2. Parallel Constraint
```javascript
new ParallelConstraint(line1, line2)
```
Makes two lines parallel.

### 3. Perpendicular Constraint
```javascript
new PerpendicularConstraint(line1, line2)
```
Makes two lines perpendicular.

### 4. Coincident Constraint
```javascript
new CoincidentConstraint(point1, point2)
```
Makes two points coincide.

### 5. Horizontal Constraint
```javascript
new HorizontalConstraint(line)
```
Makes a line horizontal.

### 6. Vertical Constraint
```javascript
new VerticalConstraint(line)
```
Makes a line vertical.

### 7. Tangent Constraint
```javascript
new TangentConstraint(circle, line)
```
Makes a line tangent to a circle.

### 8. Equal Length Constraint
```javascript
new EqualLengthConstraint(line1, line2)
```
Makes two lines equal in length.

## Events

The ConstraintManager emits the following events:

| Event | Description |
|-------|-------------|
| `constraintAdded` | Fired when a constraint is added |
| `constraintRemoved` | Fired when a constraint is removed |
| `constraintsSolved` | Fired when constraints are solved |
| `constraintError` | Fired when a constraint error occurs |
| `enabledChanged` | Fired when enabled state changes |

## Example Usage

```javascript
// Create managers
const canvasManager = new CanvasManager(svgCanvas, overlay);
const constraintManager = new ConstraintManager(canvasManager);

// Initialize
constraintManager.initialize();

// Add constraints
const line1 = new Line(point1, point2);
const line2 = new Line(point3, point4);

const parallel = new ParallelConstraint(line1, line2);
constraintManager.addConstraint(parallel);

const distance = new DistanceConstraint(point1, point3, 100);
constraintManager.addConstraint(distance);

// Solve constraints
constraintManager.solve();

// Handle constraint errors
constraintManager.on('constraintError', (error) => {
    console.error('Constraint error:', error);
});
```

## Implementation Details

### Constraint Solving Process

1. **Validation**
   - Check for constraint consistency
   - Detect circular dependencies
   - Validate constraint parameters

2. **Dependency Analysis**
   - Build constraint dependency graph
   - Sort constraints by dependency
   - Identify independent subproblems

3. **Solving**
   - Apply numerical optimization
   - Handle under/over-constrained cases
   - Iterate until convergence

4. **Update**
   - Update model positions
   - Maintain numerical stability
   - Handle solution failures

### Solver Algorithms

The constraint solver uses various algorithms:

1. **Newton-Raphson Method**
   - For solving nonlinear equations
   - Fast convergence when near solution
   - Handles most geometric constraints

2. **Pattern Analysis**
   - Recognizes common constraint patterns
   - Applies specialized solvers
   - Improves performance

3. **Relaxation Methods**
   - For handling over-constrained cases
   - Prioritizes constraints
   - Maintains stability

## Performance Considerations

1. **Solver Optimization**
   ```javascript
   // Group related constraints
   const group = new ConstraintGroup([constraint1, constraint2]);
   
   // Cache frequently used values
   constraint.cacheValues();
   
   // Use incremental solving
   constraintManager.solveIncremental();
   ```

2. **Memory Management**
   ```javascript
   // Clean up unused constraints
   constraintManager.removeOrphanedConstraints();
   
   // Pool constraint objects
   const constraint = constraintPool.acquire();
   ```

3. **Update Efficiency**
   ```javascript
   // Batch updates
   constraintManager.beginUpdate();
   // Make changes
   constraintManager.endUpdate();
   ```

## Best Practices

1. **Constraint Creation**
   ```javascript
   // Check before adding
   if (constraintManager.canAddConstraint(constraint)) {
       constraintManager.addConstraint(constraint);
   }
   ```

2. **Error Handling**
   ```javascript
   try {
       constraintManager.solve();
   } catch (error) {
       handleConstraintError(error);
   }
   ```

3. **Performance**
   ```javascript
   // Disable solving during bulk operations
   constraintManager.enabled = false;
   // Make changes
   constraintManager.enabled = true;
   constraintManager.solve();
   ``` 