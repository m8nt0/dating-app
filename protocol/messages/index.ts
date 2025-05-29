/**
 * Message protocol exports
 */

// Export handshake protocol
export * from './handshake';

// Export sync protocol
export * from './sync';

// Export discovery protocol with namespace to avoid conflicts
import * as DiscoveryProtocol from './discovery';
export { DiscoveryProtocol };

// Export resource protocol
export * from './resource';