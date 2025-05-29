/**
 * RSA encryption implementation
 */

/**
 * RSA key size in bits
 */
export enum RSAKeySize {
  RSA1024 = 1024,
  RSA2048 = 2048,
  RSA4096 = 4096
}

/**
 * RSA key format
 */
export enum RSAKeyFormat {
  PKCS1 = 'pkcs1',
  PKCS8 = 'pkcs8',
  SPKI = 'spki',
  JWK = 'jwk'
}

/**
 * RSA key pair
 */
export interface RSAKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

/**
 * RSA options
 */
export interface RSAOptions {
  keySize?: RSAKeySize;
  hash?: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
  padding?: 'PKCS1' | 'OAEP';
}

/**
 * RSA encryption service interface
 */
export interface IRSAEncryption {
  /**
   * Generate a new RSA key pair
   */
  generateKeyPair(options?: RSAOptions): Promise<RSAKeyPair>;
  
  /**
   * Encrypt data with RSA
   */
  encrypt(data: Uint8Array, publicKey: CryptoKey): Promise<Uint8Array>;
  
  /**
   * Decrypt data with RSA
   */
  decrypt(encryptedData: Uint8Array, privateKey: CryptoKey): Promise<Uint8Array>;
  
  /**
   * Sign data with RSA
   */
  sign(data: Uint8Array, privateKey: CryptoKey, options?: RSAOptions): Promise<Uint8Array>;
  
  /**
   * Verify a signature
   */
  verify(data: Uint8Array, signature: Uint8Array, publicKey: CryptoKey, options?: RSAOptions): Promise<boolean>;
  
  /**
   * Export public key
   */
  exportPublicKey(key: CryptoKey, format?: RSAKeyFormat): Promise<string | Uint8Array>;
  
  /**
   * Export private key
   */
  exportPrivateKey(key: CryptoKey, format?: RSAKeyFormat): Promise<string | Uint8Array>;
  
  /**
   * Import public key
   */
  importPublicKey(keyData: string | Uint8Array, format?: RSAKeyFormat): Promise<CryptoKey>;
  
  /**
   * Import private key
   */
  importPrivateKey(keyData: string | Uint8Array, format?: RSAKeyFormat): Promise<CryptoKey>;
}
