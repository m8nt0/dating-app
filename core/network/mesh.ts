/**
 * Mesh network coordination
 */

import { PeerInfo } from './discovery';

/**
 * Mesh network configuration
 */
export interface MeshNetworkConfig {
  maxPeers?: number;
  minPeers?: number;
  redundancyFactor?: number;
  heartbeatInterval?: number;
  pruneInterval?: number;
  bootstrapPeers?: string[];
  enableRelay?: boolean;
}

/**
 * Mesh network metrics
 */
export interface MeshMetrics {
  connectedPeers: number;
  uptime: number;
  messagesSent: number;
  messagesReceived: number;
  dataTransferred: number;
  routingTableSize: number;
  averageLatency: number;
}

/**
 * Message routing options
 */
export interface RoutingOptions {
  ttl?: number;
  priority?: number;
  broadcast?: boolean;
  path?: string[];
  retry?: boolean;
  encrypted?: boolean;
}

/**
 * Mesh network interface
 */
export interface IMeshNetwork {
  /**
   * Initialize the mesh network
   */
  init(config: MeshNetworkConfig): Promise<void>;
  
  /**
   * Start the mesh network
   */
  start(): Promise<void>;
  
  /**
   * Stop the mesh network
   */
  stop(): Promise<void>;
  
  /**
   * Join a mesh network
   */
  join(topic: string): Promise<boolean>;
  
  /**
   * Leave a mesh network
   */
  leave(topic: string): Promise<boolean>;
  
  /**
   * Send a message to a peer
   */
  sendToPeer(peerId: string, data: Uint8Array, options?: RoutingOptions): Promise<boolean>;
  
  /**
   * Broadcast a message to the mesh
   */
  broadcast(topic: string, data: Uint8Array, options?: RoutingOptions): Promise<number>;
  
  /**
   * Get direct peers in the mesh
   */
  getPeers(topic?: string): Promise<PeerInfo[]>;
  
  /**
   * Add a direct peer connection
   */
  addPeer(peerInfo: PeerInfo): Promise<boolean>;
  
  /**
   * Remove a peer connection
   */
  removePeer(peerId: string): Promise<boolean>;
  
  /**
   * Get mesh network metrics
   */
  getMetrics(): Promise<MeshMetrics>;
  
  /**
   * Add message handler
   */
  addHandler(topic: string, handler: (data: Uint8Array, from: string) => void): void;
  
  /**
   * Remove message handler
   */
  removeHandler(topic: string, handler: (data: Uint8Array, from: string) => void): void;
}