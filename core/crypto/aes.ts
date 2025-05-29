/**
 * AES encryption implementation
 */

/**
 * AES modes
 */
export enum AESMode {
  CBC = 'cbc',
  GCM = 'gcm',
  CTR = 'ctr'
}

/**
 * AES key size in bits
 */
export enum AESKeySize {
  AES128 = 128,
  AES192 = 192,
  AES256 = 256
}

/**
 * AES encryption options
 */
export interface AESOptions {
  mode?: AESMode;
  keySize?: AESKeySize;
  iterations?: number;
  tagLength?: number;
}

/**
 * AES encrypted data
 */
export interface AESEncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  salt?: Uint8Array;
  tag?: Uint8Array;
  algorithm: string;
}

/**
 * AES encryption service interface
 */
export interface IAESEncryption {
  /**
   * Generate a random AES key
   */
  generateKey(size?: AESKeySize): Promise<CryptoKey>;
  
  /**
   * Generate a key from a password
   */
  generateKeyFromPassword(password: string, salt?: Uint8Array, options?: AESOptions): Promise<CryptoKey>;
  
  /**
   * Encrypt data
   */
  encrypt(data: Uint8Array, key: CryptoKey | string, options?: AESOptions): Promise<AESEncryptedData>;
  
  /**
   * Decrypt data
   */
  decrypt(encryptedData: AESEncryptedData, key: CryptoKey | string): Promise<Uint8Array>;
  
  /**
   * Export a key to raw bytes
   */
  exportKey(key: CryptoKey): Promise<Uint8Array>;
  
  /**
   * Import a key from raw bytes
   */
  importKey(keyData: Uint8Array, options?: AESOptions): Promise<CryptoKey>;
  
  /**
   * Generate a random initialization vector
   */
  generateIV(): Uint8Array;
  
  /**
   * Generate a random salt
   */
  generateSalt(length?: number): Uint8Array;
}
