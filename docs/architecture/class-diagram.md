# Class Diagram

The following class diagram shows the relationships between the major components of the CAD Editor:

```mermaid
classDiagram
    class AppStateManager {
        -canvasManager
        -constraintManager
        -currentTool
        -undoStack[]
        -redoStack[]
        +init()
        +activateTool()
        +undo()
        +redo()
        +toggleGrid()
        +toggleSnapToGrid()
    }

    class CanvasManager {
        -svgCanvas
        -canvasOverlay
        -models[]
        -selectedModels[]
        +init()
        +addModel()
        +removeModel()
        +selectModel()
        +clearSelection()
        +render()
    }

    class ConstraintManager {
        -constraints[]
        -canvasManager
        +init()
        +addConstraint()
        +removeConstraint()
        +validateConstraints()
        +solve()
    }

    class BaseTool {
        <<abstract>>
        #canvasManager
        #constraintManager
        +activate()
        +deactivate()
        +onMouseDown()
        +onMouseMove()
        +onMouseUp()
    }

    class Model {
        <<abstract>>
        -id
        -properties
        +render()
        +hitTest()
        +getProperties()
        +setProperties()
    }

    class Point {
        -x
        -y
        +move()
        +distanceTo()
    }

    class Line {
        -startPoint
        -endPoint
        +getLength()
        +getAngle()
    }

    class Circle {
        -center
        -radius
        +getArea()
        +getCircumference()
    }

    class Arc {
        -center
        -radius
        -startAngle
        -endAngle
        +getLength()
    }

    class Rectangle {
        -topLeft
        -width
        -height
        +getArea()
        +getPerimeter()
    }

    AppStateManager --> CanvasManager
    AppStateManager --> ConstraintManager
    AppStateManager --> BaseTool
    CanvasManager --> Model
    ConstraintManager --> Model
    BaseTool --> Model
    Model <|-- Point
    Model <|-- Line
    Model <|-- Circle
    Model <|-- Arc
    Model <|-- Rectangle
    Line --> Point
    Circle --> Point
    Arc --> Point
    Rectangle --> Point
```

## Class Relationships

### AppStateManager
- Central manager for application state
- Maintains undo/redo history
- Manages tool activation and grid settings
- Coordinates between CanvasManager and ConstraintManager

### CanvasManager
- Handles rendering and model management
- Manages selection state
- Coordinates with SVG canvas and overlay
- Provides model manipulation methods

### ConstraintManager
- Manages geometric constraints between models
- Validates constraint satisfaction
- Solves constraint systems
- Updates model positions based on constraints

### Models
All model classes inherit from the abstract Model class and implement:
- Rendering logic
- Hit testing
- Property management
- Geometric calculations

### Tools
All tools inherit from BaseTool and implement:
- Mouse event handling
- Model creation/modification logic
- Constraint creation
- Visual feedback

## Inheritance Hierarchies

### Models
```mermaid
graph TD
    A[Model] --> B[Point]
    A --> C[Line]
    A --> D[Circle]
    A --> E[Arc]
    A --> F[Rectangle]
```

### Tools
```mermaid
graph TD
    A[BaseTool] --> B[SelectTool]
    A --> C[LineTool]
    A --> D[CircleTool]
    A --> E[ArcTool]
    A --> F[RectangleTool]
``` 