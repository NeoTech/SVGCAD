/**
 * Simple script to start the CAD Editor application
 * This script will check if serve is installed and start the server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Default port
const PORT = process.env.PORT || 3000;

// Check if we're running in development mode
const isDev = process.argv.includes('--dev');

console.log('Starting CAD Editor v2...');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
}

// Main function to start the server
async function startServer() {
  try {
    // Check if package.json exists
    if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
      console.log('package.json not found. Creating a basic one...');
      
      const packageJson = {
        "name": "cad-editor-v2",
        "version": "1.0.0",
        "description": "A web-based CAD editor",
        "main": "index.html",
        "scripts": {
          "start": "serve"
        }
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
    }
    
    // Find an available port
    const port = await findAvailablePort(PORT);
    
    // Check if serve is installed globally
    let serveInstalled = false;
    try {
      execSync('serve --version', { stdio: 'ignore' });
      serveInstalled = true;
    } catch (e) {
      // serve is not installed globally
    }
    
    if (!serveInstalled) {
      console.log('The "serve" package is not installed globally.');
      console.log('Checking if it\'s installed locally...');
      
      // Check if node_modules exists and contains serve
      const nodeModulesPath = path.join(__dirname, 'node_modules', 'serve');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('Installing serve locally (this may take a moment)...');
        execSync('npm install serve --no-save', { stdio: 'inherit' });
      }
    }
    
    // Start the server
    console.log(`Starting server on port ${port}...`);
    
    const command = serveInstalled 
      ? `serve -l ${port}` 
      : `npx serve -l ${port}`;
    
    execSync(command, { stdio: 'inherit' });
    
  } catch (error) {
    console.error('Error starting the server:', error.message);
    console.log('\nAlternative methods to start the application:');
    console.log('1. Open index.html directly in your browser');
    console.log('2. Run "npx serve" in the project directory');
    console.log('3. Run "python -m http.server" if Python is installed');
    process.exit(1);
  }
}

// Start the server
startServer(); 