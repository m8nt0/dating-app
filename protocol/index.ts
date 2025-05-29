/**
 * Protocol definitions entry point
 * 
 * This file exports all protocol definitions for the decentralized dating app.
 */

// Export schema definitions with namespace to avoid conflicts
import * as Schema from './schema';
export { Schema };

// Export message protocols with namespace to avoid conflicts
import * as Messages from './messages';
export { Messages };

// Export API interfaces with namespace to avoid conflicts
import * as API from './api';
export { API };

/**
 * Protocol version
 */
export const PROTOCOL_VERSION = '0.1.0'; 