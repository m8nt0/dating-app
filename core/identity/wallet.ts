import * as sodium from 'libsodium-wrappers';

/**
 * Secure key storage interface
 */
export interface SecureKeyStore {
  /**
   * Save keys to secure storage
   */
  saveKeys(keys: Map<KeyType, KeyPair>): Promise<boolean>;
  
  /**
   * Load keys from secure storage
   */
  loadKeys(password: string): Promise<Record<string, KeyPair>>;
  
  /**
   * Clear all keys from storage
   */
  clearKeys(): Promise<boolean>;
}

/**
 * Wallet implementation for key management
 */

/**
 * Key type
 */
export enum KeyType {
  SIGNING = 'signing',
  ENCRYPTION = 'encryption',
  AUTHENTICATION = 'authentication',
  AGREEMENT = 'agreement',
  EXCHANGE = 'exchange'
}

/**
 * Key algorithm
 */
export enum KeyAlgorithm {
  ED25519 = 'ed25519',
  X25519 = 'x25519',
  SECP256K1 = 'secp256k1',
  RSA = 'rsa',
  P256 = 'p256'
}

/**
 * Key pair
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  type: KeyType;
  algorithm: KeyAlgorithm;
  id: string;
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * Wallet options
 */
export interface WalletOptions {
  storagePrefix?: string;
  defaultKeyAlgorithm?: Record<KeyType, KeyAlgorithm>;
  enableEncryption?: boolean;
  autoBackup?: boolean;
  backupMethod?: 'cloud' | 'local' | 'none';
}

/**
 * Wallet interface
 */
export interface IWallet {
  /**
   * Initialize the wallet
   */
  init(options?: WalletOptions): Promise<void>;
  
  /**
   * Create a new key pair
   */
  createKeyPair(type: KeyType, algorithm?: KeyAlgorithm): Promise<KeyPair>;
  
  /**
   * Get a key pair by ID
   */
  getKeyPair(id: string): Promise<KeyPair | null>;
  
  /**
   * Get key pairs by type
   */
  getKeyPairsByType(type: KeyType): Promise<KeyPair[]>;
  
  /**
   * Get the default key pair for a type
   */
  getDefaultKeyPair(type: KeyType): Promise<KeyPair | null>;
  
  /**
   * Set the default key pair for a type
   */
  setDefaultKeyPair(keyId: string, type: KeyType): Promise<boolean>;
  
  /**
   * Import a key pair
   */
  importKeyPair(privateKey: Uint8Array, type: KeyType, algorithm: KeyAlgorithm, metadata?: Record<string, any>): Promise<KeyPair>;
  
  /**
   * Export a key pair
   */
  exportKeyPair(id: string, includePrivateKey?: boolean): Promise<{
    publicKey: string;
    privateKey?: string;
    type: KeyType;
    algorithm: KeyAlgorithm;
  }>;
  
  /**
   * Delete a key pair
   */
  deleteKeyPair(id: string): Promise<boolean>;
  
  /**
   * Sign data with a key
   */
  sign(data: Uint8Array, keyId?: string): Promise<Uint8Array>;
  
  /**
   * Verify a signature
   */
  verify(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array, algorithm?: KeyAlgorithm): Promise<boolean>;
  
  /**
   * Encrypt data
   */
  encrypt(data: Uint8Array, recipientPublicKey: Uint8Array, algorithm?: KeyAlgorithm): Promise<Uint8Array>;
  
  /**
   * Decrypt data
   */
  decrypt(data: Uint8Array, keyId?: string): Promise<Uint8Array>;
  
  /**
   * Create a backup of all keys
   */
  backup(password: string): Promise<Uint8Array>;
  
  /**
   * Restore keys from a backup
   */
  restore(backup: Uint8Array, password: string): Promise<number>;
  
  /**
   * Lock the wallet
   */
  lock(): Promise<void>;
  
  /**
   * Unlock the wallet
   */
  unlock(password: string): Promise<boolean>;
  
  /**
   * Check if the wallet is locked
   */
  isLocked(): boolean;
  
  /**
   * Clear all keys and reset the wallet
   */
  clear(): Promise<void>;
}

/**
 * Wallet implementation for managing cryptographic keys
 */
export class Wallet implements IWallet {
  private initialized = false;
  private keyStore: SecureKeyStore;
  private keyPairs: Map<KeyType, KeyPair> = new Map();
  private locked = true;

  /**
   * Create a new wallet instance
   * @param keyStore - Secure storage mechanism for keys
   */
  constructor(keyStore: SecureKeyStore) {
    this.keyStore = keyStore;
  }

  /**
   * Initialize the wallet and libsodium
   */
  async init(): Promise<void> {
    if (!this.initialized) {
      await sodium.ready;
      this.initialized = true;
    }
  }

  /**
   * Unlock the wallet with a password
   * @param password - User's password
   */
  async unlock(password: string): Promise<boolean> {
    await this.init();
    
    try {
      // Load keys from secure storage
      const keys = await this.keyStore.loadKeys(password);
      
      // Populate key pairs from storage
      this.keyPairs.clear();
      for (const [typeStr, keyPair] of Object.entries(keys)) {
        this.keyPairs.set(typeStr as KeyType, keyPair as KeyPair);
      }
      
      this.locked = false;
      return true;
    } catch (error) {
      console.error("Failed to unlock wallet:", error);
      return false;
    }
  }

  /**
   * Lock the wallet, clearing keys from memory
   */
  async lock(): Promise<void> {
    this.keyPairs.clear();
    this.locked = true;
  }

  /**
   * Create a new key pair of the specified type
   * @param type - Type of key to create
   */
  async createKeyPair(type: KeyType, algorithm: KeyAlgorithm = KeyAlgorithm.ED25519): Promise<KeyPair> {
    await this.init();

    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    // Generate a new keypair
    const keyPair = sodium.crypto_box_keypair();
    const publicKeyStr = sodium.to_base64(keyPair.publicKey);
    const privateKeyStr = sodium.to_base64(keyPair.privateKey);
    
    const newKeyPair: KeyPair = {
      publicKey: publicKeyStr,
      privateKey: privateKeyStr,
      type,
      algorithm,
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now()
    };
    
    // Store in memory
    this.keyPairs.set(type, newKeyPair);
    
    // Persist to secure storage
    await this.keyStore.saveKeys(this.keyPairs);
    
    return newKeyPair;
  }

  /**
   * Get public key for a specific key type
   * @param type - Type of key to retrieve
   */
  async getPublicKey(type: KeyType): Promise<string | null> {
    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    const keyPair = this.keyPairs.get(type);
    return keyPair ? keyPair.publicKey : null;
  }

  /**
   * Sign a message using a specific key type (defaults to SIGNING)
   * @param message - Message data to sign
   * @param keyType - Key type to use for signing
   */
  async sign(message: Uint8Array, keyId?: string): Promise<Uint8Array> {
    await this.init();

    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    // Find the key to use for signing
    let keyPair: KeyPair | undefined;
    
    if (keyId) {
      // Find by ID
      for (const kp of this.keyPairs.values()) {
        if (kp.id === keyId) {
          keyPair = kp;
          break;
        }
      }
    } else {
      // Use default signing key
      keyPair = this.keyPairs.get(KeyType.SIGNING);
    }
    
    if (!keyPair) {
      throw new Error(`No signing key available`);
    }

    const privateKeyBin = sodium.from_base64(keyPair.privateKey);
    return sodium.crypto_sign_detached(message, privateKeyBin);
  }

  /**
   * Verify a signature using a public key
   * @param data - Original message
   * @param signature - Signature to verify
   * @param publicKey - Public key to use for verification
   */
  async verify(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
    await this.init();
    return sodium.crypto_sign_verify_detached(signature, data, publicKey);
  }

  /**
   * Encrypt data for a recipient
   * @param data - Data to encrypt
   * @param recipientPublicKey - Recipient's public key
   */
  async encrypt(data: Uint8Array, recipientPublicKey: Uint8Array): Promise<Uint8Array> {
    await this.init();

    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    const keyPair = this.keyPairs.get(KeyType.EXCHANGE);
    if (!keyPair) {
      throw new Error('No exchange key available for encryption');
    }

    const senderKeyBin = sodium.from_base64(keyPair.privateKey);
    
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const encrypted = sodium.crypto_box_easy(data, nonce, recipientPublicKey, senderKeyBin);
    
    // Combine nonce and encrypted data
    const result = new Uint8Array(nonce.length + encrypted.length);
    result.set(nonce);
    result.set(encrypted, nonce.length);
    
    return result;
  }

  /**
   * Decrypt data from a sender
   * @param encryptedData - Encrypted data (nonce + ciphertext)
   * @param senderPublicKey - Sender's public key
   */
  async decrypt(data: Uint8Array, keyId?: string): Promise<Uint8Array> {
    await this.init();

    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    // Find the key to use for decryption
    let keyPair: KeyPair | undefined;
    
    if (keyId) {
      // Find by ID
      for (const kp of this.keyPairs.values()) {
        if (kp.id === keyId) {
          keyPair = kp;
          break;
        }
      }
    } else {
      // Use default exchange key
      keyPair = this.keyPairs.get(KeyType.EXCHANGE);
    }
    
    if (!keyPair) {
      throw new Error('No exchange key available for decryption');
    }

    // For a real implementation, this would handle the sender's public key and decryption
    // This is a simplified version
    return new Uint8Array(32); // Placeholder
  }

  /**
   * Export all public keys
   */
  async exportPublicKeys(): Promise<Record<KeyType, string>> {
    if (this.locked) {
      throw new Error('Wallet is locked');
    }

    const result: Partial<Record<KeyType, string>> = {};
    
    for (const [type, keyPair] of this.keyPairs.entries()) {
      result[type] = keyPair.publicKey;
    }
    
    return result as Record<KeyType, string>;
  }
  
  // Implement remaining interface methods
  
  async getKeyPair(id: string): Promise<KeyPair | null> {
    if (this.locked) {
      throw new Error('Wallet is locked');
    }
    
    for (const keyPair of this.keyPairs.values()) {
      if (keyPair.id === id) {
        return keyPair;
      }
    }
    
    return null;
  }
  
  async getKeyPairsByType(type: KeyType): Promise<KeyPair[]> {
    if (this.locked) {
      throw new Error('Wallet is locked');
    }
    
    const result: KeyPair[] = [];
    for (const keyPair of this.keyPairs.values()) {
      if (keyPair.type === type) {
        result.push(keyPair);
      }
    }
    
    return result;
  }
  
  async getDefaultKeyPair(type: KeyType): Promise<KeyPair | null> {
    if (this.locked) {
      throw new Error('Wallet is locked');
    }
    
    return this.keyPairs.get(type) || null;
  }
  
  async setDefaultKeyPair(keyId: string, type: KeyType): Promise<boolean> {
    return false; // Placeholder
  }
  
  async importKeyPair(privateKey: Uint8Array, type: KeyType, algorithm: KeyAlgorithm, metadata?: Record<string, any>): Promise<KeyPair> {
    throw new Error('Not implemented');
  }
  
  async exportKeyPair(id: string, includePrivateKey?: boolean): Promise<{
    publicKey: string;
    privateKey?: string;
    type: KeyType;
    algorithm: KeyAlgorithm;
  }> {
    throw new Error('Not implemented');
  }
  
  async deleteKeyPair(id: string): Promise<boolean> {
    return false; // Placeholder
  }
  
  async backup(password: string): Promise<Uint8Array> {
    return new Uint8Array(0); // Placeholder
  }
  
  async restore(backup: Uint8Array, password: string): Promise<number> {
    return 0; // Placeholder
  }
  
  isLocked(): boolean {
    return this.locked;
  }
  
  async clear(): Promise<void> {
    this.keyPairs.clear();
    this.locked = true;
    await this.keyStore.clearKeys();
  }
}
