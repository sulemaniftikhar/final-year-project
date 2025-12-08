// Centralized logging utility for consistent error handling and debugging

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Logger utility for consistent logging across the application
 */
export const logger = {
    /**
     * Log informational messages (only in development)
     */
    info: (...args) => {
        if (isDevelopment) {
            console.log('[INFO]', ...args);
        }
    },

    /**
     * Log warning messages
     */
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Log error messages (always logged)
     */
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (...args) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Log success messages (only in development)
     */
    success: (...args) => {
        if (isDevelopment) {
            console.log('[SUCCESS]', ...args);
        }
    }
};

export default logger;
