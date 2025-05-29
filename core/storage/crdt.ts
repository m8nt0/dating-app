/**
 * Conflict-free Replicated Data Types (CRDT) implementation
 */

/**
 * CRDT operation types
 */
export enum CRDTOperationType {
  SET = 'set',
  DELETE = 'delete',
  ADD = 'add',
  REMOVE = 'remove'
}

/**
 * CRDT operation
 */
export interface CRDTOperation {
  id: string;
  type: CRDTOperationType;
  key: string;
  value?: any;
  timestamp: number;
  actor: string;
  dependencies?: string[];
}

/**
 * CRDT document configuration
 */
export interface CRDTConfig {
  replicationFactor?: number;
  conflictResolution?: 'lww' | 'custom';
  customConflictResolver?: (op1: CRDTOperation, op2: CRDTOperation) => CRDTOperation;
  maxOperationsPerBatch?: number;
  gcInterval?: number;
}

/**
 * CRDT document interface
 */
export interface ICRDTDocument<T = any> {
  /**
   * Initialize the CRDT document
   */
  init(id: string, config?: CRDTConfig): Promise<void>;
  
  /**
   * Set a value
   */
  set(key: string, value: any): Promise<void>;
  
  /**
   * Delete a value
   */
  delete(key: string): Promise<void>;
  
  /**
   * Get a value
   */
  get(key: string): any;
  
  /**
   * Get the current document state
   */
  getState(): T;
  
  /**
   * Get the document version vector
   */
  getVersionVector(): Record<string, number>;
  
  /**
   * Apply an operation
   */
  applyOperation(operation: CRDTOperation): Promise<boolean>;
  
  /**
   * Apply a batch of operations
   */
  applyOperations(operations: CRDTOperation[]): Promise<number>;
  
  /**
   * Get operations since a specific version vector
   */
  getOperationsSince(versionVector: Record<string, number>): CRDTOperation[];
  
  /**
   * Subscribe to changes
   */
  subscribe(callback: (op: CRDTOperation, newState: T) => void): () => void;
  
  /**
   * Merge with another CRDT document
   */
  merge(other: ICRDTDocument<T>): Promise<void>;
}
