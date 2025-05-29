/**
 * Decentralized Identifier (DID) implementation
 */

import { KeyType, KeyAlgorithm } from './wallet';

/**
 * DID method
 */
export enum DIDMethod {
  KEY = 'key',
  WEB = 'web',
  ION = 'ion',
  PEER = 'peer',
  JWK = 'jwk',
  ETH = 'ethr'
}

/**
 * Verification method type
 */
export enum VerificationMethodType {
  JSON_WEB_KEY_2020 = 'JsonWebKey2020',
  ED25519_VERIFICATION_KEY_2018 = 'Ed25519VerificationKey2018',
  X25519_KEY_AGREEMENT_KEY_2019 = 'X25519KeyAgreementKey2019',
  SECP256K1_VERIFICATION_KEY_2018 = 'Secp256k1VerificationKey2018',
  ECC_SECP256K1_RECOVERY_2020 = 'EcdsaSecp256k1RecoveryMethod2020'
}

/**
 * Verification method purpose
 */
export enum VerificationMethodPurpose {
  AUTHENTICATION = 'authentication',
  ASSERTION_METHOD = 'assertionMethod',
  KEY_AGREEMENT = 'keyAgreement',
  CAPABILITY_INVOCATION = 'capabilityInvocation',
  CAPABILITY_DELEGATION = 'capabilityDelegation'
}

/**
 * Verification method
 */
export interface VerificationMethod {
  id: string;
  type: VerificationMethodType;
  controller: string;
  publicKeyJwk?: Record<string, any>;
  publicKeyMultibase?: string;
  publicKeyHex?: string;
}

/**
 * Service endpoint
 */
export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | string[] | Record<string, any>;
  description?: string;
}

/**
 * DID document
 */
export interface DIDDocument {
  '@context': string | string[];
  id: string;
  controller?: string | string[];
  alsoKnownAs?: string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: ServiceEndpoint[];
}

/**
 * DID resolution result
 */
export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didResolutionMetadata: {
    contentType?: string;
    error?: string;
    message?: string;
  };
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
    versionId?: string;
    nextVersionId?: string;
    equivalentId?: string;
    canonicalId?: string;
  };
}

/**
 * DID service interface
 */
export interface IDIDService {
  /**
   * Create a new DID
   */
  create(method: DIDMethod, options?: {
    keyType?: KeyType;
    keyAlgorithm?: KeyAlgorithm;
    controller?: string;
    services?: ServiceEndpoint[];
  }): Promise<{
    did: string;
    document: DIDDocument;
    keyId: string;
  }>;
  
  /**
   * Resolve a DID to a DID document
   */
  resolve(did: string): Promise<DIDResolutionResult>;
  
  /**
   * Update a DID document
   */
  update(did: string, operations: Array<{
    op: 'add' | 'remove' | 'replace';
    path: string;
    value?: any;
  }>): Promise<DIDDocument>;
  
  /**
   * Add a verification method to a DID
   */
  addVerificationMethod(
    did: string,
    keyId: string,
    purpose: VerificationMethodPurpose | VerificationMethodPurpose[]
  ): Promise<DIDDocument>;
  
  /**
   * Add a service to a DID
   */
  addService(did: string, service: Omit<ServiceEndpoint, 'id'>): Promise<DIDDocument>;
  
  /**
   * Remove a service from a DID
   */
  removeService(did: string, serviceId: string): Promise<DIDDocument>;
  
  /**
   * Deactivate a DID
   */
  deactivate(did: string): Promise<boolean>;
  
  /**
   * Check if a DID is controlled by the current user
   */
  isOwner(did: string): Promise<boolean>;
  
  /**
   * Get all DIDs owned by the current user
   */
  listDIDs(): Promise<string[]>;
  
  /**
   * Create a DID URL
   */
  createDIDURL(did: string, path?: string, query?: Record<string, string>, fragment?: string): string;
  
  /**
   * Parse a DID URL
   */
  parseDIDURL(didUrl: string): {
    did: string;
    method: string;
    id: string;
    path?: string;
    query?: Record<string, string>;
    fragment?: string;
  };
} 