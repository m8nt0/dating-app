/**
 * Resource management protocol
 */
/**
 * Resource operation type
 */
export enum ResourceOperationType {
  REQUEST = 'request',
  OFFER = 'offer',
  RESPONSE = 'response',
  UPDATE = 'update',
  REVOKE = 'revoke'
}

/**
 * Resource type
 */
export enum ResourceType {
  STORAGE = 'storage',
  BANDWIDTH = 'bandwidth',
  COMPUTATION = 'computation',
  RELAY = 'relay',
  CONTENT = 'content',
  SERVICE = 'service'
}

/**
 * Base resource message interface
 */
export interface ResourceMessage {
  type: MessageType.RESOURCE;
  operation: ResourceOperationType;
  peerId: string;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

/**
 * Resource request message
 */
export interface ResourceRequestMessage extends ResourceMessage {
  operation: ResourceOperationType.REQUEST;
  resourceType: ResourceType;
  amount: number;
  duration?: number;
  maxPrice?: number;
  priority?: number;
  requirements?: Record<string, any>;
}

/**
 * Resource offer message
 */
export interface ResourceOfferMessage extends ResourceMessage {
  operation: ResourceOperationType.OFFER;
  resourceType: ResourceType;
  amount: number;
  price?: number;
  duration?: number;
  conditions?: Record<string, any>;
  expiry?: number;
  signature?: string;
}

/**
 * Resource response message
 */
export interface ResourceResponseMessage extends ResourceMessage {
  operation: ResourceOperationType.RESPONSE;
  requestId: string;
  accepted: boolean;
  resourceType: ResourceType;
  amount: number;
  price?: number;
  duration?: number;
  resourceId?: string;
  accessInfo?: Record<string, any>;
  reason?: string;
}

/**
 * Resource update message
 */
export interface ResourceUpdateMessage extends ResourceMessage {
  operation: ResourceOperationType.UPDATE;
  resourceId: string;
  resourceType: ResourceType;
  usage: {
    current: number;
    limit: number;
    remaining: number;
  };
  expiresAt?: number;
}

/**
 * Resource revoke message
 */
export interface ResourceRevokeMessage extends ResourceMessage {
  operation: ResourceOperationType.REVOKE;
  resourceId: string;
  resourceType: ResourceType;
  reason: string;
}

/**
 * Create a resource request message
 */
export function createResourceRequest(
  peerId: string,
  resourceType: ResourceType,
  amount: number,
  duration?: number,
  maxPrice?: number
): ResourceRequestMessage {
  return {
    type: MessageType.RESOURCE,
    operation: ResourceOperationType.REQUEST,
    peerId,
    timestamp: Date.now(),
    resourceType,
    amount,
    duration,
    maxPrice
  };
}

/**
 * Create a resource response message
 */
export function createResourceResponse(
  peerId: string,
  requestId: string,
  accepted: boolean,
  resourceType: ResourceType,
  amount: number,
  resourceId?: string,
  accessInfo?: Record<string, any>,
  reason?: string
): ResourceResponseMessage {
  return {
    type: MessageType.RESOURCE,
    operation: ResourceOperationType.RESPONSE,
    peerId,
    timestamp: Date.now(),
    requestId,
    accepted,
    resourceType,
    amount,
    resourceId,
    accessInfo,
    reason
  };
} 