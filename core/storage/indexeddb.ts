/**
 * Web storage adapter using IndexedDB
 */

/**
 * IndexedDB storage configuration
 */
export interface IndexedDBConfig {
  databaseName?: string;
  version?: number;
  collections?: string[];
  indexes?: Record<string, string[]>;
  upgradeFn?: (db: IDBDatabase, oldVersion: number, newVersion: number) => void;
  maxBatchSize?: number;
}

/**
 * Query options
 */
export interface QueryOptions {
  filter?: Record<string, any>;
  sort?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  index?: string;
  range?: IDBKeyRange;
}

/**
 * IndexedDB storage adapter interface
 */
export interface IIndexedDBStorage {
  /**
   * Initialize the database
   */
  init(config: IndexedDBConfig): Promise<void>;
  
  /**
   * Open the database
   */
  open(): Promise<IDBDatabase>;
  
  /**
   * Close the database
   */
  close(): void;
  
  /**
   * Create a collection
   */
  createCollection(name: string, indexes?: string[]): Promise<void>;
  
  /**
   * Drop a collection
   */
  dropCollection(name: string): Promise<void>;
  
  /**
   * Add an item to a collection
   */
  add<T extends { id: string }>(collectionName: string, item: T): Promise<string>;
  
  /**
   * Add multiple items to a collection
   */
  addMany<T extends { id: string }>(collectionName: string, items: T[]): Promise<string[]>;
  
  /**
   * Get an item by ID
   */
  get<T>(collectionName: string, id: string): Promise<T | null>;
  
  /**
   * Update an item
   */
  update<T extends { id: string }>(collectionName: string, id: string, updates: Partial<T>): Promise<boolean>;
  
  /**
   * Delete an item
   */
  delete(collectionName: string, id: string): Promise<boolean>;
  
  /**
   * Query items
   */
  query<T>(collectionName: string, options?: QueryOptions): Promise<T[]>;
  
  /**
   * Count items
   */
  count(collectionName: string, options?: QueryOptions): Promise<number>;
  
  /**
   * Get all items
   */
  getAll<T>(collectionName: string): Promise<T[]>;
  
  /**
   * Clear a collection
   */
  clear(collectionName: string): Promise<void>;
  
  /**
   * Delete the database
   */
  deleteDatabase(): Promise<void>;
}