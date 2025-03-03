/**
 * Logger utility for the CAD Editor
 * Provides consistent logging throughout the application with different log levels
 * and integration with the debug panel
 */
class Logger {
    constructor() {
        this.logEntries = [];
        this.maxEntries = 100;
        this.logToConsole = true;
        this.initialized = false;
        this.logCallback = null;
    }

    /**
     * Initialize the logger
     * @param {Object} appState - The Alpine.js application state
     */
    init(appState) {
        if (this.initialized) {
            this.warn('Logger already initialized');
            return;
        }

        try {
            this.appState = appState;
            this.initialized = true;
            this.info('Logger initialized successfully');
        } catch (error) {
            console.error('Failed to initialize logger:', error);
        }
    }

    /**
     * Set a callback function to be called for each log entry
     * @param {Function} callback - The callback function
     */
    setLogCallback(callback) {
        if (typeof callback === 'function') {
            this.logCallback = callback;
            this.info('Log callback set');
        } else {
            console.error('Invalid log callback provided');
        }
    }

    /**
     * Log an informational message
     * @param {string} message - The message to log
     */
    info(message) {
        this._log('info', message);
    }

    /**
     * Log a warning message
     * @param {string} message - The message to log
     */
    warn(message) {
        this._log('warn', message);
    }

    /**
     * Log an error message
     * @param {string} message - The message to log
     */
    error(message) {
        this._log('error', message);
    }

    /**
     * Log a debug message (only shown when debug mode is enabled)
     * @param {string} message - The message to log
     */
    debug(message) {
        this._log('debug', message);
    }

    /**
     * Internal method to handle logging
     * @param {string} level - The log level (info, warn, error, debug)
     * @param {string} message - The message to log
     * @private
     */
    _log(level, message) {
        const timestamp = new Date().toISOString().substring(11, 23);
        const entry = { level, message, timestamp };
        
        // Add to internal log array
        this.logEntries.unshift(entry);
        
        // Trim log if it exceeds max entries
        if (this.logEntries.length > this.maxEntries) {
            this.logEntries.pop();
        }
        
        // Log to console if enabled
        if (this.logToConsole) {
            const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
            console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        }
        
        // Call the log callback if set
        if (this.logCallback && typeof this.logCallback === 'function') {
            try {
                this.logCallback(entry);
            } catch (error) {
                console.error('Error in log callback:', error);
            }
        }
        
        // Update Alpine.js state if initialized
        if (this.initialized && this.appState) {
            try {
                this.appState.logEntries = [...this.logEntries];
            } catch (error) {
                console.error('Failed to update app state with log entry:', error);
            }
        }
    }

    /**
     * Clear all log entries
     */
    clear() {
        this.logEntries = [];
        if (this.initialized && this.appState) {
            try {
                this.appState.logEntries = [];
                this.info('Log cleared');
            } catch (error) {
                console.error('Failed to clear log entries in app state:', error);
            }
        }
    }
}

// Create a singleton instance
const logger = new Logger();

// Export the singleton
window.logger = logger; 