# CAD Editor v2

A web-based CAD (Computer-Aided Design) editor built with JavaScript, SVG, and Alpine.js. This application allows users to create and manipulate basic geometric shapes in a browser environment.

## Features

- **Drawing Tools**: Line, Rectangle, Circle, and Arc tools for creating basic shapes
- **Selection Tool**: Select, move, resize, and delete shapes
- **Grid System**: Configurable grid with snap functionality
- **Constraints**: Snap to grid, points, and lines
- **Undo/Redo**: Support for undoing and redoing actions
- **SVG Export**: Export drawings as SVG files
- **Debug Mode**: Debug panel for development and troubleshooting

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- For npm/npx methods: [Node.js](https://nodejs.org/) (version 12 or higher)

### Installation and Running

#### Method 1: Using the Startup Scripts (Easiest)

This method automatically handles everything for you:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cad-editor-v2.git
   cd cad-editor-v2
   ```

2. Run the appropriate startup script for your operating system:

   **Windows:**
   ```
   start.bat
   ```
   
   **macOS/Linux:**
   ```
   chmod +x start.sh
   ./start.sh
   ```

   The scripts will:
   - Check if Node.js is installed
   - Fall back to Python if available (on macOS/Linux)
   - Start the server automatically
   - Open your browser to the application

#### Method 2: Using Node.js Directly

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cad-editor-v2.git
   cd cad-editor-v2
   ```

2. Run the start script:
   ```
   node start.js
   ```

#### Method 3: Direct File Opening

The simplest way to run the application without any server:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cad-editor-v2.git
   ```

2. Open `index.html` in your web browser.

#### Method 4: Using npm/npx

This method provides a local development server:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cad-editor-v2.git
   cd cad-editor-v2
   ```

2. Install dependencies (one-time setup):
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   
   This will start a server at http://localhost:5000

   Alternatively, you can use:
   ```
   npm run dev
   ```
   
   This will start a server at http://localhost:3000

#### Method 5: Using npx directly

If you have Node.js installed but don't want to install dependencies:

```
npx serve
```

#### Other Methods

You can also use other local development servers:

```
# Using Python
python -m http.server

# Using Visual Studio Code
# Install the "Live Server" extension and right-click on index.html
```

## Usage

### Tools

- **Select Tool**: Click on shapes to select them. Drag to move. Use handles to resize.
- **Line Tool**: Click to set the start point, then click again to set the end point.
- **Rectangle Tool**: Click to set the first corner, then click again to set the opposite corner. Hold Shift for a square.
- **Circle Tool**: Click to set the center, then click again to set the radius. Press 'D' to toggle between center-radius and diameter modes.
- **Arc Tool**: Click to set the center, then the radius, then the start angle, and finally the end angle.

### Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo
- **Ctrl+S**: Export as SVG
- **Escape**: Cancel current operation
- **Delete**: Delete selected shapes (when using Select Tool)

### Settings

- **Grid**: Toggle grid visibility
- **Snap Grid**: Toggle snap to grid
- **Snap Points**: Toggle snap to points
- **Snap Lines**: Toggle snap to lines
- **Debug**: Toggle debug panel

## Architecture

The CAD Editor is built with a modular architecture:

- **Models**: Point, Line, Rectangle, Circle, Arc
- **Managers**: Canvas, Constraint, Application State
- **Tools**: Base Tool, Select, Line, Rectangle, Circle, Arc
- **Utilities**: Logger, Math Utilities

## Development

### Project Structure

```
cad-editor-v2/
├── css/
│   └── styles.css
├── js/
│   ├── managers/
│   │   ├── appStateManager.js
│   │   ├── canvasManager.js
│   │   └── constraintManager.js
│   ├── models/
│   │   ├── arc.js
│   │   ├── circle.js
│   │   ├── line.js
│   │   ├── point.js
│   │   └── rectangle.js
│   ├── tools/
│   │   ├── arcTool.js
│   │   ├── baseTool.js
│   │   ├── circleTool.js
│   │   ├── lineTool.js
│   │   ├── rectangleTool.js
│   │   └── selectTool.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── mathUtils.js
│   └── main.js
├── package.json
├── start.js
├── start.bat
├── start.sh
└── index.html
```

### Extending the Editor

To add a new shape:

1. Create a new model in the `js/models/` directory
2. Implement the necessary methods (render, clone, etc.)
3. Create a new tool in the `js/tools/` directory that extends BaseTool
4. Register the tool in `js/main.js`
5. Add a button in `index.html`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Alpine.js](https://alpinejs.dev/) for reactive UI components
- SVG for vector graphics rendering 