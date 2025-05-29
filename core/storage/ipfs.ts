/**
 * IPFS storage integration
 */

/**
 * IPFS configuration
 */
export interface IPFSConfig {
  gateway?: string;
  pinningService?: string;
  apiKey?: string;
  timeout?: number;
  useLocalNode?: boolean;
  localNodeConfig?: {
    repo?: string;
    start?: boolean;
    relay?: boolean;
  };
}

/**
 * File metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  mimeType?: string;
  lastModified?: number;
  encryption?: {
    algorithm: string;
    keyId: string;
  };
}

/**
 * Storage options
 */
export interface IPFSStorageOptions {
  pin?: boolean;
  encrypt?: boolean;
  wrapWithDirectory?: boolean;
  progress?: (progress: number) => void;
  timeout?: number;
  cidVersion?: 0 | 1;
  preserveFileName?: boolean;
}

/**
 * IPFS storage service interface
 */
export interface IIPFSStorage {
  /**
   * Initialize IPFS
   */
  init(config: IPFSConfig): Promise<void>;
  
  /**
   * Add file to IPFS
   */
  addFile(
    data: Uint8Array | Blob | File,
    metadata?: FileMetadata,
    options?: IPFSStorageOptions
  ): Promise<string>;
  
  /**
   * Add files to IPFS
   */
  addFiles(
    files: Array<{ data: Uint8Array | Blob | File; metadata?: FileMetadata }>,
    options?: IPFSStorageOptions
  ): Promise<string[]>;
  
  /**
   * Add data to IPFS
   */
  addData(
    data: string | Uint8Array | Record<string, any>,
    options?: IPFSStorageOptions
  ): Promise<string>;
  
  /**
   * Get file from IPFS
   */
  getFile(cid: string, decrypt?: boolean): Promise<{ data: Uint8Array; metadata?: FileMetadata }>;
  
  /**
   * Get data from IPFS
   */
  getData<T = any>(cid: string, decrypt?: boolean): Promise<T>;
  
  /**
   * Pin content to IPFS
   */
  pin(cid: string): Promise<boolean>;
  
  /**
   * Unpin content from IPFS
   */
  unpin(cid: string): Promise<boolean>;
  
  /**
   * Check if content is pinned
   */
  isPinned(cid: string): Promise<boolean>;
  
  /**
   * List pinned content
   */
  listPins(): Promise<string[]>;
  
  /**
   * Encrypt data
   */
  encrypt(data: Uint8Array, recipientPublicKey?: string): Promise<Uint8Array>;
  
  /**
   * Decrypt data
   */
  decrypt(data: Uint8Array, senderPublicKey?: string): Promise<Uint8Array>;
}