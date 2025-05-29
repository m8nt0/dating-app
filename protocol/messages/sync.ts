/**
 * Sync protocol messages for data synchronization between nodes
 */
/**
 * Type of sync messages
 */
export enum SyncType {
  SYNC_REQUEST = 'sync_request',
  SYNC_RESPONSE = 'sync_response',
  CHANGE_BATCH = 'change_batch',
  CHANGE_ACK = 'change_ack',
  CLOCK_SYNC = 'clock_sync',
  STATE_VECTOR = 'state_vector'
}

/**
 * Base interface for sync messages
 */
export interface BaseSyncMessage {
  type: SyncType;
  senderId: string;
  recipientId?: string;
  timestamp: number;
  messageId: string;
}

/**
 * Message to request a sync from another node
 */
export interface SyncRequestMessage extends BaseSyncMessage {
  type: SyncType.SYNC_REQUEST;
  collections: string[];
  since?: number;
  filters?: Record<string, any>;
  stateVector?: Record<string, number>;
}

/**
 * Message to respond to a sync request
 */
export interface SyncResponseMessage extends BaseSyncMessage {
  type: SyncType.SYNC_RESPONSE;
  requestId: string;
  complete: boolean;
  cursor?: string;
  collection?: string;
  stateVector?: Record<string, number>;
}

/**
 * Message containing a batch of changes
 */
export interface ChangeBatchMessage extends BaseSyncMessage {
  type: SyncType.CHANGE_BATCH;
  collection: string;
  changes: Array<{
    id: string;
    version: number;
    timestamp: number;
    data: any;
    operation: 'create' | 'update' | 'delete';
  }>;
  requestId?: string;
  batchId: string;
  hasMore: boolean;
}

/**
 * Message to acknowledge receipt of changes
 */
export interface ChangeAckMessage extends BaseSyncMessage {
  type: SyncType.CHANGE_ACK;
  batchId: string;
  accepted: string[];
  rejected: Array<{
    id: string;
    reason: string;
  }>;
  stateVector: Record<string, number>;
}

/**
 * Message to synchronize clocks between nodes
 */
export interface ClockSyncMessage extends BaseSyncMessage {
  type: SyncType.CLOCK_SYNC;
  sentAt: number;
  roundtrip?: number;
}

/**
 * Message to communicate CRDT state vector
 */
export interface StateVectorMessage extends BaseSyncMessage {
  type: SyncType.STATE_VECTOR;
  vector: Record<string, number>;
  collection: string;
}

/**
 * Type union for all sync messages
 */
export type SyncMessageTypes =
  | SyncRequestMessage
  | SyncResponseMessage
  | ChangeBatchMessage
  | ChangeAckMessage
  | ClockSyncMessage
  | StateVectorMessage;

/**
 * Data synchronization protocol
 */

/**
 * Sync operation type
 */
export enum SyncOperationType {
  REQUEST = 'request',
  RESPONSE = 'response',
  UPDATE = 'update',
  CONFLICT = 'conflict',
  COMPLETE = 'complete'
}

/**
 * Base sync message interface for protocol-specific messages
 */
export interface ProtocolSyncMessage {
  type: MessageType.SYNC;
  operation: SyncOperationType;
  peerId: string;
  collection: string;
  timestamp: number;
  version: string;
  metadata?: Record<string, any>;
}

/**
 * Sync request message for protocol
 */
export interface ProtocolSyncRequestMessage extends ProtocolSyncMessage {
  operation: SyncOperationType.REQUEST;
  vectorClock: Record<string, number>;
  limit?: number;
  filter?: Record<string, any>;
}

/**
 * Sync response message for protocol
 */
export interface ProtocolSyncResponseMessage extends ProtocolSyncMessage {
  operation: SyncOperationType.RESPONSE;
  operations: Array<{
    id: string;
    key: string;
    value: any;
    timestamp: number;
    actor: string;
  }>;
  complete: boolean;
  cursor?: string;
}

/**
 * Sync update message for protocol
 */
export interface ProtocolSyncUpdateMessage extends ProtocolSyncMessage {
  operation: SyncOperationType.UPDATE;
  operations: Array<{
    id: string;
    key: string;
    value: any;
    timestamp: number;
    actor: string;
  }>;
}

/**
 * Sync conflict message for protocol
 */
export interface ProtocolSyncConflictMessage extends ProtocolSyncMessage {
  operation: SyncOperationType.CONFLICT;
  key: string;
  operations: Array<{
    id: string;
    value: any;
    timestamp: number;
    actor: string;
  }>;
  resolution?: {
    id: string;
    value: any;
    timestamp: number;
    actor: string;
  };
}

/**
 * Sync complete message for protocol
 */
export interface ProtocolSyncCompleteMessage extends ProtocolSyncMessage {
  operation: SyncOperationType.COMPLETE;
  vectorClock: Record<string, number>;
  stats: {
    operationsProcessed: number;
    bytesTransferred: number;
    duration: number;
  };
}

/**
 * Create a sync request message for protocol
 */
export function createProtocolSyncRequest(
  peerId: string,
  collection: string,
  vectorClock: Record<string, number>,
  filter?: Record<string, any>,
  limit?: number
): ProtocolSyncRequestMessage {
  return {
    type: MessageType.SYNC,
    operation: SyncOperationType.REQUEST,
    peerId,
    collection,
    timestamp: Date.now(),
    version: '1.0',
    vectorClock,
    filter,
    limit
  };
}

/**
 * Create a sync response message for protocol
 */
export function createProtocolSyncResponse(
  peerId: string,
  collection: string,
  operations: ProtocolSyncResponseMessage['operations'],
  complete: boolean,
  cursor?: string
): ProtocolSyncResponseMessage {
  return {
    type: MessageType.SYNC,
    operation: SyncOperationType.RESPONSE,
    peerId,
    collection,
    timestamp: Date.now(),
    version: '1.0',
    operations,
    complete,
    cursor
  };
} 