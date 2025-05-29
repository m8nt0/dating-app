/**
 * libp2p networking implementation
 */

/**
 * libp2p node configuration
 */
export interface Libp2pConfig {
  peerId?: string;
  addresses?: string[];
  bootstrap?: string[];
  pubsub?: boolean;
  relay?: boolean;
  dht?: boolean;
}

/**
 * libp2p node interface
 */
export interface ILibp2pNode {
  /**
   * Initialize the libp2p node
   */
  init(config: Libp2pConfig): Promise<void>;
  
  /**
   * Start the libp2p node
   */
  start(): Promise<void>;
  
  /**
   * Stop the libp2p node
   */
  stop(): Promise<void>;
  
  /**
   * Connect to a peer
   */
  connect(peerAddress: string): Promise<boolean>;
  
  /**
   * Publish a message to a topic
   */
  publish(topic: string, data: Uint8Array): Promise<void>;
  
  /**
   * Subscribe to a topic
   */
  subscribe(topic: string, handler: (data: Uint8Array, from: string) => void): Promise<void>;
  
  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): Promise<void>;
  
  /**
   * Find peers providing a specific service
   */
  findProviders(serviceId: string, limit?: number): Promise<string[]>;
  
  /**
   * Register as a provider for a service
   */
  provideService(serviceId: string): Promise<void>;
}
