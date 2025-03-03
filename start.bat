@echo off
echo Starting CAD Editor v2...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Alternatively, you can open index.html directly in your browser.
    pause
    exit /b 1
)

:: Run the start script
node start.js

:: If the script fails, provide alternative instructions
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to start using Node.js.
    echo You can try opening index.html directly in your browser.
    pause
) 