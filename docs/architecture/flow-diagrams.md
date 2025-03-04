# Flow Diagrams

This document outlines the key processes and workflows in the CAD Editor application.

## Application Initialization Flow

```mermaid
sequenceDiagram
    participant M as Main
    participant AS as AppStateManager
    participant CM as CanvasManager
    participant CO as ConstraintManager
    participant T as Tools

    M->>AS: Initialize
    M->>CM: Initialize
    M->>CO: Initialize
    AS->>CM: Register
    AS->>CO: Register
    AS->>T: Register Tools
    CM->>M: Ready
    Note over M: App Ready
```

## Drawing Operation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant T as Tool
    participant AS as AppStateManager
    participant CM as CanvasManager
    participant CO as ConstraintManager

    U->>T: Mouse Down
    T->>CM: Begin Operation
    CM->>AS: Record State
    T->>U: Visual Feedback
    U->>T: Mouse Move
    T->>CM: Update Preview
    T->>CO: Check Constraints
    CO-->>T: Constraint Results
    T->>U: Update Visual Feedback
    U->>T: Mouse Up
    T->>CM: Finalize Operation
    CM->>AS: Save State
    AS->>U: Operation Complete
```

## Undo/Redo Flow

```mermaid
sequenceDiagram
    participant U as User
    participant AS as AppStateManager
    participant CM as CanvasManager
    participant CO as ConstraintManager

    U->>AS: Undo Request
    AS->>AS: Pop State from Stack
    AS->>CM: Restore Models
    AS->>CO: Restore Constraints
    CM->>U: Update Display
    Note over U: State Restored
```

## Constraint Resolution Flow

```mermaid
sequenceDiagram
    participant M as Model
    participant CO as ConstraintManager
    participant CM as CanvasManager

    M->>CO: Position Changed
    CO->>CO: Validate Constraints
    CO->>CO: Build Equation System
    CO->>CO: Solve System
    CO->>M: Update Position
    M->>CM: Request Render
    CM->>CM: Update Canvas
```

## Save/Export Flow

```mermaid
sequenceDiagram
    participant U as User
    participant AS as AppStateManager
    participant CM as CanvasManager
    participant FS as File System

    U->>AS: Export Request
    AS->>CM: Get Model Data
    CM->>CM: Convert to SVG
    CM->>AS: SVG Data
    AS->>FS: Write File
    FS-->>U: File Saved
```

## Tool Activation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant AS as AppStateManager
    participant OT as Old Tool
    participant NT as New Tool
    participant CM as CanvasManager

    U->>AS: Select Tool
    AS->>OT: Deactivate
    OT->>CM: Clear Temporary State
    AS->>NT: Activate
    NT->>CM: Initialize Tool State
    NT->>U: Ready for Input
```

These flow diagrams illustrate the main processes in the CAD Editor application. Each diagram shows the interaction between different components and the sequence of operations that occur during various user actions. 