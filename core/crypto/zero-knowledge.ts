/**
 * Zero-Knowledge Proofs
 */

/**
 * ZK proof type
 */
export enum ZKProofType {
  SCHNORR = 'schnorr',
  BULLETPROOF = 'bulletproof',
  GROTH16 = 'groth16',
  PLONK = 'plonk',
  STARK = 'stark'
}

/**
 * ZK proof configuration
 */
export interface ZKProofConfig {
  proofType: ZKProofType;
  securityLevel?: number;
  curve?: 'ed25519' | 'secp256k1' | 'bn254';
  circuitFile?: string;
  publicInputs?: string[];
}

/**
 * Verification attribute
 */
export interface VerificationAttribute {
  name: string;
  dataType: 'boolean' | 'number' | 'string' | 'date' | 'range';
  constraints?: Record<string, any>;
  isPrivate: boolean;
}

/**
 * Verification claim
 */
export interface VerificationClaim {
  id: string;
  subject: string;
  attribute: string;
  value: any;
  metadata?: Record<string, any>;
}

/**
 * ZK proof
 */
export interface ZKProof {
  id: string;
  type: ZKProofType;
  publicInputs: Record<string, any>;
  proof: Uint8Array;
  verificationKey: Uint8Array;
  claims: string[];
}

/**
 * Zero-knowledge service interface
 */
export interface IZeroKnowledgeService {
  /**
   * Initialize the ZK service
   */
  init(config: ZKProofConfig): Promise<void>;
  
  /**
   * Register a verification attribute
   */
  registerAttribute(attribute: VerificationAttribute): Promise<string>;
  
  /**
   * Create a verification claim
   */
  createClaim(
    attributeName: string,
    value: any,
    subject: string,
    isPrivate?: boolean
  ): Promise<VerificationClaim>;
  
  /**
   * Generate a zero-knowledge proof
   */
  generateProof(
    claims: string[],
    publicInputs?: Record<string, any>,
    options?: Partial<ZKProofConfig>
  ): Promise<ZKProof>;
  
  /**
   * Verify a zero-knowledge proof
   */
  verifyProof(
    proof: ZKProof,
    options?: { publicInputsOverride?: Record<string, any> }
  ): Promise<boolean>;
  
  /**
   * Generate a verifiable presentation
   */
  generatePresentation(
    claims: string[],
    selectedAttributes: string[],
    challenge?: string
  ): Promise<{
    presentation: any;
    proof: ZKProof;
  }>;
  
  /**
   * Verify a presentation
   */
  verifyPresentation(presentation: any, challenge?: string): Promise<boolean>;
  
  /**
   * Generate a range proof
   */
  generateRangeProof(
    value: number,
    range: [number, number]
  ): Promise<ZKProof>;
  
  /**
   * Verify a range proof
   */
  verifyRangeProof(
    proof: ZKProof,
    range: [number, number]
  ): Promise<boolean>;
}