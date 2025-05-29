/**
 * Native storage adapter using SQLite
 */

/**
 * SQLite configuration
 */
export interface SQLiteConfig {
  databasePath?: string;
  pragma?: Record<string, any>;
  migrations?: Array<{
    version: number;
    up: string;
    down?: string;
  }>;
  logQueries?: boolean;
  encryptionKey?: string;
}

/**
 * Query parameters
 */
export type SQLiteParams = Array<string | number | boolean | null | Uint8Array>;

/**
 * Query result
 */
export interface QueryResult {
  rows: any[];
  rowsAffected: number;
  lastInsertId?: number;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  mode?: 'deferred' | 'immediate' | 'exclusive';
  rollbackOn?: 'error' | 'exception' | 'never';
}

/**
 * SQLite storage adapter interface
 */
export interface ISQLiteStorage {
  /**
   * Initialize the database
   */
  init(config: SQLiteConfig): Promise<void>;
  
  /**
   * Open database connection
   */
  open(): Promise<void>;
  
  /**
   * Close database connection
   */
  close(): Promise<void>;
  
  /**
   * Execute a SQL query
   */
  execute(sql: string, params?: SQLiteParams): Promise<QueryResult>;
  
  /**
   * Execute multiple SQL queries
   */
  executeBatch(queries: Array<{ sql: string; params?: SQLiteParams }>): Promise<QueryResult[]>;
  
  /**
   * Begin a transaction
   */
  beginTransaction(options?: TransactionOptions): Promise<void>;
  
  /**
   * Commit a transaction
   */
  commitTransaction(): Promise<void>;
  
  /**
   * Rollback a transaction
   */
  rollbackTransaction(): Promise<void>;
  
  /**
   * Execute queries in a transaction
   */
  transaction<T>(
    callback: (storage: ISQLiteStorage) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>;
  
  /**
   * Get a single row
   */
  get<T = any>(sql: string, params?: SQLiteParams): Promise<T | null>;
  
  /**
   * Get all rows
   */
  all<T = any>(sql: string, params?: SQLiteParams): Promise<T[]>;
  
  /**
   * Create a table
   */
  createTable(tableName: string, columns: Record<string, string>): Promise<void>;
  
  /**
   * Drop a table
   */
  dropTable(tableName: string): Promise<void>;
  
  /**
   * Check if a table exists
   */
  tableExists(tableName: string): Promise<boolean>;
  
  /**
   * Run migrations
   */
  migrate(targetVersion?: number): Promise<number>;
}