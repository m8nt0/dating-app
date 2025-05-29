/**
 * Network peer discovery module
 */

import { PeerCapabilities } from '../../protocol/messages/discovery';

/**
 * Peer information
 */
export interface PeerInfo {
  id: string;
  publicKey: string;
  addresses: string[];
  capabilities: PeerCapabilities;
  lastSeen: number;
  distance?: number;
  metadata?: Record<string, any>;
}

/**
 * Discovery options
 */
export interface DiscoveryOptions {
  announceInterval?: number;
  maxCachedPeers?: number;
  bootstrapNodes?: string[];
  enableMDNS?: boolean;
  enableDHT?: boolean;
}

/**
 * Peer discovery service interface
 */
export interface IDiscoveryService {
  /**
   * Initialize the discovery service
   */
  init(options: DiscoveryOptions): Promise<void>;
  
  /**
   * Start discovery
   */
  start(): Promise<void>;
  
  /**
   * Stop discovery
   */
  stop(): Promise<void>;
  
  /**
   * Announce presence to the network
   */
  announce(): Promise<void>;
  
  /**
   * Find peers by criteria
   */
  findPeers(criteria?: Partial<PeerCapabilities>, limit?: number): Promise<PeerInfo[]>;
  
  /**
   * Find peers near a location
   */
  findPeersNearLocation(locationHash: string, limit?: number): Promise<PeerInfo[]>;
  
  /**
   * Get a specific peer by ID
   */
  getPeer(peerId: string): Promise<PeerInfo | null>;
  
  /**
   * Register a capability for the local peer
   */
  registerCapability(capability: keyof PeerCapabilities, enabled: boolean): Promise<void>;
}
