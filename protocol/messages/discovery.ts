/**
 * Peer discovery protocol
 */

/**
 * Peer capabilities
 */
export interface PeerCapabilities {
  supportsDirectConnection: boolean;
  supportsRelay: boolean;
  supportsDHT: boolean;
  supportsPubSub: boolean;
  supportsDataStore: boolean;
  maxConnections?: number;
  resources?: Record<string, number>;
}

/**
 * Discovery operation type
 */
export enum DiscoveryOperationType {
  ANNOUNCE = 'announce',
  QUERY = 'query',
  RESPONSE = 'response',
  PING = 'ping',
  PONG = 'pong',
  LEAVE = 'leave'
}

/**
 * Discovery message type
 */
export enum DiscoveryType {
  FIND_PEERS = 'find_peers',
  PEERS_RESPONSE = 'peers_response',
  FIND_RESOURCE = 'find_resource',
  RESOURCE_RESPONSE = 'resource_response'
}

/**
 * Base discovery message interface
 */
export interface DiscoveryMessage {
  type: MessageType.DISCOVERY;
  operation: DiscoveryOperationType;
  peerId: string;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

/**
 * Base extended discovery message interface
 */
export interface ExtendedDiscoveryMessage {
  peerId: string;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

/**
 * Peer announcement message
 */
export interface AnnounceMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.ANNOUNCE;
  addresses: string[];
  capabilities: PeerCapabilities;
  publicKey: string;
  locationHint?: string;
  services?: string[];
  expiry?: number;
}

/**
 * Peer query message
 */
export interface QueryMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.QUERY;
  criteria?: {
    capabilities?: Partial<PeerCapabilities>;
    services?: string[];
    locationHint?: string;
    maxResults?: number;
  };
}

/**
 * Peer response message
 */
export interface ResponseMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.RESPONSE;
  peers: Array<{
    id: string;
    addresses: string[];
    capabilities: PeerCapabilities;
    publicKey: string;
    locationHint?: string;
    services?: string[];
    lastSeen: number;
  }>;
  complete: boolean;
}

/**
 * Ping message
 */
export interface PingMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.PING;
  nonce: string;
}

/**
 * Pong message
 */
export interface PongMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.PONG;
  nonce: string;
  latency?: number;
}

/**
 * Leave message
 */
export interface LeaveMessage extends DiscoveryMessage {
  operation: DiscoveryOperationType.LEAVE;
  reason?: string;
}

/**
 * Create an announce message
 */
export function createAnnounceMessage(
  peerId: string,
  addresses: string[],
  capabilities: PeerCapabilities,
  publicKey: string,
  locationHint?: string,
  services?: string[]
): AnnounceMessage {
  return {
    type: MessageType.DISCOVERY,
    operation: DiscoveryOperationType.ANNOUNCE,
    peerId,
    timestamp: Date.now(),
    addresses,
    capabilities,
    publicKey,
    locationHint,
    services
  };
}

/**
 * Create a query message
 */
export function createQueryMessage(
  peerId: string,
  criteria?: QueryMessage['criteria']
): QueryMessage {
  return {
    type: MessageType.DISCOVERY,
    operation: DiscoveryOperationType.QUERY,
    peerId,
    timestamp: Date.now(),
    criteria
  };
}

/**
 * Message to find peers by criteria
 */
export interface FindPeersMessage extends ExtendedDiscoveryMessage {
  type: DiscoveryType.FIND_PEERS;
  limit?: number;
  matchCapabilities?: Partial<PeerCapabilities>;
  nearLocationHash?: string;
  excludePeers?: string[];
}

/**
 * Message with peer discovery results
 */
export interface PeersResponseMessage extends ExtendedDiscoveryMessage {
  type: DiscoveryType.PEERS_RESPONSE;
  requestId: string;
  peers: Array<{
    id: string;
    publicKey: string;
    addresses: string[];
    capabilities: PeerCapabilities;
    lastSeen: number;
  }>;
}

/**
 * Resource query options
 */
export interface ResourceQuery {
  resourceType: string;
  resourceId?: string;
  contentType?: string;
  metadata?: Record<string, any>;
  partial?: boolean;
}

/**
 * Message to find a resource on the network
 */
export interface FindResourceMessage extends ExtendedDiscoveryMessage {
  type: DiscoveryType.FIND_RESOURCE;
  query: ResourceQuery;
  limit?: number;
}

/**
 * Message with resource discovery results
 */
export interface ResourceResponseMessage extends ExtendedDiscoveryMessage {
  type: DiscoveryType.RESOURCE_RESPONSE;
  requestId: string;
  resources: Array<{
    resourceId: string;
    peerId: string;
    addresses: string[];
    size?: number;
    metadata?: Record<string, any>;
    contentType?: string;
  }>;
}

/**
 * Type union for all discovery messages
 */
export type DiscoveryMessageTypes =
  | AnnounceMessage
  | QueryMessage
  | ResponseMessage
  | FindPeersMessage
  | PeersResponseMessage
  | FindResourceMessage
  | ResourceResponseMessage
  | PingMessage
  | PongMessage
  | LeaveMessage; 