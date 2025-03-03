#!/bin/bash

echo "Starting CAD Editor v2..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    echo "Alternatively, you can open index.html directly in your browser."
    
    # Check if Python is available as a fallback
    if command -v python3 &> /dev/null; then
        echo ""
        echo "Would you like to use Python to start a simple server instead? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "Starting Python server..."
            python3 -m http.server 8000
            exit 0
        fi
    elif command -v python &> /dev/null; then
        echo ""
        echo "Would you like to use Python to start a simple server instead? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "Starting Python server..."
            python -m SimpleHTTPServer 8000
            exit 0
        fi
    fi
    
    exit 1
fi

# Make the script executable if it isn't already
chmod +x start.js

# Run the start script
node start.js

# If the script fails, provide alternative instructions
if [ $? -ne 0 ]; then
    echo ""
    echo "Failed to start using Node.js."
    
    # Check if Python is available as a fallback
    if command -v python3 &> /dev/null; then
        echo "Would you like to use Python to start a simple server instead? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "Starting Python server..."
            python3 -m http.server 8000
            exit 0
        fi
    elif command -v python &> /dev/null; then
        echo "Would you like to use Python to start a simple server instead? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "Starting Python server..."
            python -m SimpleHTTPServer 8000
            exit 0
        fi
    fi
    
    echo "You can try opening index.html directly in your browser."
fi 