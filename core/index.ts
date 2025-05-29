/**
 * Core SDK entry point
 * 
 * This file exports all core modules for the decentralized dating app.
 */

// Export identity module
export * from './identity';

// Export network module
export * from './network';

// Export storage module
export * from './storage';

// Export matching module
export * from './matching';

// Export crypto module
export * from './crypto';

// Export incentives module
export * from './incentives';

/**
 * SDK version
 */
export const VERSION = '0.1.0';

/**
 * Initialize the core SDK
 */
export async function initializeSDK(config?: any): Promise<boolean> {
  try {
    // SDK initialization logic would go here
    return true;
  } catch (error) {
    console.error('Failed to initialize SDK:', error);
    return false;
  }
}

/**
 * SDK configuration options
 */
export interface SDKOptions {
  /**
   * Storage prefix for local data
   */
  storagePrefix?: string;
  
  /**
   * Enable verbose logging
   */
  enableLogging?: boolean;
  
  /**
   * Bootstrap server URLs
   */
  bootstrapServers?: string[];
  
  /**
   * Maximum storage space to use (in MB)
   */
  maxStorageSpace?: number;
} 