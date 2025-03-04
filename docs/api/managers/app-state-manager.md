# App State Manager

The `AppStateManager` class is the central coordinator for the CAD application's state. It manages tools, undo/redo operations, and coordinates between different components of the system.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentTool` | BaseTool | The currently active tool |
| `canvasManager` | CanvasManager | Reference to the canvas manager |
| `constraintManager` | ConstraintManager | Reference to the constraint manager |
| `undoStack` | Array<Command> | Stack of commands for undo |
| `redoStack` | Array<Command> | Stack of commands for redo |
| `maxUndoSteps` | Number | Maximum number of undo steps |
| `autoSaveEnabled` | Boolean | Whether auto-save is enabled |
| `debugMode` | Boolean | Whether debug mode is enabled |

## Methods

### Constructor

```javascript
constructor(canvasManager, constraintManager)
```

Creates a new AppStateManager instance.

**Parameters:**
- `canvasManager` (CanvasManager): Reference to the canvas manager
- `constraintManager` (ConstraintManager): Reference to the constraint manager

### initialize()

```javascript
initialize()
```

Initializes the app state manager and sets up event handlers.

### registerTool(tool)

```javascript
registerTool(tool)
```

Registers a drawing tool.

**Parameters:**
- `tool` (BaseTool): The tool to register

### activateTool(toolName)

```javascript
activateTool(toolName)
```

Activates a tool by name.

**Parameters:**
- `toolName` (String): The name of the tool to activate

### executeCommand(command)

```javascript
executeCommand(command)
```

Executes a command and adds it to the undo stack.

**Parameters:**
- `command` (Command): The command to execute

### undo()

```javascript
undo()
```

Undoes the last command.

### redo()

```javascript
redo()
```

Redoes the last undone command.

### clearHistory()

```javascript
clearHistory()
```

Clears the undo/redo history.

### saveState()

```javascript
saveState()
```

Saves the current application state.

### loadState(state)

```javascript
loadState(state)
```

Loads a saved application state.

**Parameters:**
- `state` (Object): The state to load

### setMaxUndoSteps(steps)

```javascript
setMaxUndoSteps(steps)
```

Sets the maximum number of undo steps.

**Parameters:**
- `steps` (Number): Maximum number of steps

### toggleAutoSave(enabled)

```javascript
toggleAutoSave(enabled)
```

Toggles auto-save functionality.

**Parameters:**
- `enabled` (Boolean): Whether to enable auto-save

### toggleDebugMode()

```javascript
toggleDebugMode()
```

Toggles debug mode.

### exportFile(format)

```javascript
exportFile(format)
```

Exports the current drawing.

**Parameters:**
- `format` (String): Export format ('svg', 'json', etc.)

**Returns:**
- (String|Object): The exported content

## Events

The AppStateManager emits the following events:

| Event | Description |
|-------|-------------|
| `toolActivated` | Fired when a tool is activated |
| `commandExecuted` | Fired when a command is executed |
| `undoStateChanged` | Fired when undo/redo state changes |
| `stateChanged` | Fired when application state changes |
| `autoSaveStateChanged` | Fired when auto-save state changes |
| `debugModeChanged` | Fired when debug mode changes |

## Example Usage

```javascript
// Create managers
const canvasManager = new CanvasManager(svgCanvas, overlay);
const constraintManager = new ConstraintManager();
const appStateManager = new AppStateManager(canvasManager, constraintManager);

// Initialize
appStateManager.initialize();

// Register tools
appStateManager.registerTool(new SelectTool(canvasManager, constraintManager));
appStateManager.registerTool(new LineTool(canvasManager, constraintManager));

// Activate tool
appStateManager.activateTool('line');

// Execute command
const command = new CreateLineCommand(startPoint, endPoint);
appStateManager.executeCommand(command);

// Undo/Redo
appStateManager.undo();
appStateManager.redo();

// Save/Load state
const state = appStateManager.saveState();
appStateManager.loadState(state);

// Export
const svg = appStateManager.exportFile('svg');
```

## Command Pattern

The AppStateManager uses the Command pattern for all operations that modify the application state. Each command must implement:

```javascript
class Command {
    execute() {
        // Perform the operation
    }
    
    undo() {
        // Reverse the operation
    }
    
    redo() {
        // Re-perform the operation
    }
}
```

## State Management

The application state includes:

1. **Model State**
   - Geometric models
   - Selection state
   - Constraints

2. **View State**
   - Canvas view
   - Grid settings
   - Visual properties

3. **Tool State**
   - Active tool
   - Tool-specific state

4. **Application Settings**
   - Auto-save settings
   - Debug mode
   - Undo limit

## Implementation Details

### Command Management
- Commands are executed through the command pattern
- Each command is recorded in the undo stack
- Commands can be undone and redone
- Stack size is limited by maxUndoSteps

### State Persistence
- State is serialized to JSON
- Auto-save uses localStorage
- Export supports multiple formats
- State includes all necessary data for restoration

### Tool Management
- Tools are registered with unique names
- Only one tool can be active at a time
- Tool state is preserved during switching
- Tools receive all necessary manager references

## Performance Considerations

1. **Command Execution**
   - Commands are lightweight objects
   - Undo/redo operations are optimized
   - State changes are batched when possible

2. **State Management**
   - Partial state updates when possible
   - Efficient state serialization
   - Minimal state storage

3. **Event Handling**
   - Events are debounced when appropriate
   - Event listeners are properly cleaned up
   - Event data is minimized

## Best Practices

1. **Command Creation**
   ```javascript
   // Create atomic commands
   const command = new MoveModelCommand(model, dx, dy);
   
   // Combine multiple operations
   const command = new CompositeCommand([cmd1, cmd2]);
   ```

2. **State Management**
   ```javascript
   // Save state periodically
   setInterval(() => {
       if (appStateManager.autoSaveEnabled) {
           appStateManager.saveState();
       }
   }, 5000);
   ```

3. **Tool Management**
   ```javascript
   // Register tools at startup
   tools.forEach(tool => appStateManager.registerTool(tool));
   
   // Handle tool activation
   appStateManager.on('toolActivated', (tool) => {
       updateUI(tool);
   });
   ``` 