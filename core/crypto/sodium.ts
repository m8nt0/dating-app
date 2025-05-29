/**
 * Libsodium integration
 */

/**
 * Sodium cryptographic primitive
 */
export enum SodiumPrimitive {
  X25519 = 'x25519',
  ED25519 = 'ed25519',
  XCHACHA20POLY1305 = 'xchacha20poly1305',
  BLAKE2B = 'blake2b',
  ARGON2ID = 'argon2id'
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  salt: Uint8Array;
  opsLimit?: number;
  memLimit?: number;
  algorithm?: 'argon2id' | 'argon2i';
  hashLength?: number;
}

/**
 * Libsodium service interface
 */
export interface ISodiumCrypto {
  /**
   * Initialize libsodium
   */
  init(): Promise<void>;
  
  /**
   * Is libsodium ready
   */
  isReady(): boolean;
  
  /**
   * Generate a random key pair
   */
  generateKeyPair(primitive?: SodiumPrimitive): Promise<{
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  }>;
  
  /**
   * Generate a random key
   */
  generateKey(length?: number): Promise<Uint8Array>;
  
  /**
   * Generate a random nonce
   */
  generateNonce(length?: number): Promise<Uint8Array>;
  
  /**
   * Generate a random salt
   */
  generateSalt(length?: number): Promise<Uint8Array>;
  
  /**
   * Encrypt a message
   */
  encrypt(
    message: Uint8Array,
    key: Uint8Array,
    nonce?: Uint8Array,
    additionalData?: Uint8Array
  ): Promise<{
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    tag?: Uint8Array;
  }>;
  
  /**
   * Decrypt a message
   */
  decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
    additionalData?: Uint8Array,
    tag?: Uint8Array
  ): Promise<Uint8Array>;
  
  /**
   * Compute a public key from a private key
   */
  getPublicKey(privateKey: Uint8Array, primitive?: SodiumPrimitive): Promise<Uint8Array>;
  
  /**
   * Sign a message
   */
  sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
  
  /**
   * Verify a signature
   */
  verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
  
  /**
   * Derive a key from a password
   */
  deriveKey(password: string, params: KeyDerivationParams): Promise<Uint8Array>;
  
  /**
   * Compute a hash
   */
  hash(data: Uint8Array, algorithm?: 'blake2b' | 'sha256' | 'sha512'): Promise<Uint8Array>;
  
  /**
   * Perform a key exchange
   */
  keyExchange(publicKey: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
  
  /**
   * Encode binary data to base64
   */
  toBase64(data: Uint8Array): string;
  
  /**
   * Decode base64 to binary data
   */
  fromBase64(base64: string): Uint8Array;
}