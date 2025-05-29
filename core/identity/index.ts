/**
 * Identity module exports
 */

// Export wallet components
export * from './wallet';

// Export DID components
export * from './did';

// Export recovery mechanisms
export * from './recovery';

// Export verification components with renamed exports to avoid conflicts
import * as VerificationModule from './verification';
export { VerificationModule };
