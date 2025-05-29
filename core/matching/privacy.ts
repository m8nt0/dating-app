/**
 * Privacy-preserving matching
 */

/**
 * Privacy level
 */
export enum PrivacyLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum'
}

/**
 * Privacy protection methods
 */
export enum PrivacyMethod {
  ENCRYPTED_MATCHING = 'encrypted_matching',
  DIFFERENTIAL_PRIVACY = 'differential_privacy',
  HOMOMORPHIC_ENCRYPTION = 'homomorphic_encryption',
  SECURE_MULTIPARTY_COMPUTATION = 'secure_multiparty_computation',
  ZERO_KNOWLEDGE_PROOFS = 'zero_knowledge_proofs'
}

/**
 * Privacy configuration
 */
export interface PrivacyConfig {
  level: PrivacyLevel;
  methods: PrivacyMethod[];
  noiseLevel?: number;
  minimumGroupSize?: number;
  locationPrecision?: number;
  useProxies?: boolean;
  encryptAttributes?: string[];
}

/**
 * Attribute rule
 */
export interface AttributeRule {
  attribute: string;
  protection: 'none' | 'hash' | 'encrypt' | 'generalize' | 'remove';
  visibleTo: 'none' | 'matches' | 'everyone';
  generalizeConfig?: {
    precision: number;
    ranges?: Array<[number, number]>;
  };
}

/**
 * Privacy-preserving matching service interface
 */
export interface IPrivacyMatchingService {
  /**
   * Initialize the privacy service
   */
  init(config: PrivacyConfig): Promise<void>;
  
  /**
   * Set privacy level
   */
  setPrivacyLevel(level: PrivacyLevel): Promise<void>;
  
  /**
   * Apply privacy transformation to user profile
   */
  applyPrivacyTransformation(userId: string, forUserId?: string): Promise<any>;
  
  /**
   * Match users in a privacy-preserving way
   */
  privateMatch(userId1: string, userId2: string): Promise<{
    isMatch: boolean;
    score?: number;
    revealedAttributes: string[];
  }>;
  
  /**
   * Set attribute rules
   */
  setAttributeRules(rules: AttributeRule[]): Promise<void>;
  
  /**
   * Get current privacy settings
   */
  getPrivacySettings(userId: string): Promise<{
    level: PrivacyLevel;
    methods: PrivacyMethod[];
    rules: AttributeRule[];
  }>;
  
  /**
   * Generate secure matching proofs
   */
  generateMatchingProof(matchId: string): Promise<string>;
  
  /**
   * Verify matching proof
   */
  verifyMatchingProof(matchId: string, proof: string): Promise<boolean>;
}