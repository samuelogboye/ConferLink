import timeout from 'connect-timeout';

/**
 * Timeout middleware
 * Set the timeout value to 60 seconds (in milliseconds) for all requests.
 */
export const timeoutMiddleware = timeout(60000);
