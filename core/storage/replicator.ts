/**
 * Data replication and synchronization
 */

import { CRDTOperation } from './crdt';

/**
 * Replication strategy
 */
export enum ReplicationStrategy {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  SELECTIVE = 'selective',
  ON_DEMAND = 'on_demand'
}

/**
 * Replication configuration
 */
export interface ReplicationConfig {
  strategy: ReplicationStrategy;
  syncInterval?: number;
  maxConcurrentSyncs?: number;
  priorityPeers?: string[];
  conflictResolution?: 'remote' | 'local' | 'merge';
  maxBatchSize?: number;
  collections?: string[];
}

/**
 * Replication status
 */
export interface ReplicationStatus {
  lastSyncTime?: number;
  activeSyncs: number;
  pendingSyncs: number;
  completedSyncs: number;
  failedSyncs: number;
  syncErrors: Array<{
    peerId: string;
    collection: string;
    error: string;
    timestamp: number;
  }>;
}

/**
 * Replicator interface
 */
export interface IReplicator {
  /**
   * Initialize the replicator
   */
  init(config: ReplicationConfig): Promise<void>;
  
  /**
   * Start replication
   */
  start(): Promise<void>;
  
  /**
   * Stop replication
   */
  stop(): Promise<void>;
  
  /**
   * Force a sync with a specific peer
   */
  syncWithPeer(peerId: string, collections?: string[]): Promise<boolean>;
  
  /**
   * Get replication status
   */
  getStatus(): ReplicationStatus;
  
  /**
   * Register a collection for replication
   */
  registerCollection(collectionName: string): Promise<void>;
  
  /**
   * Unregister a collection from replication
   */
  unregisterCollection(collectionName: string): Promise<void>;
  
  /**
   * Push operations to peers
   */
  pushOperations(collectionName: string, operations: CRDTOperation[]): Promise<number>;
  
  /**
   * Pull operations from peers
   */
  pullOperations(collectionName: string, fromPeers?: string[]): Promise<CRDTOperation[]>;
  
  /**
   * Get remote state vector
   */
  getRemoteStateVector(peerId: string, collection: string): Promise<Record<string, number>>;
  
  /**
   * Register a conflict resolution handler
   */
  onConflict(handler: (collection: string, op1: CRDTOperation, op2: CRDTOperation) => CRDTOperation): void;
}
