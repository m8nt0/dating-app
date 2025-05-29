/**
 * Identity verification mechanisms
 */

/**
 * Verification type
 */
export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SOCIAL = 'social',
  GOVERNMENT_ID = 'government_id',
  BIOMETRIC = 'biometric',
  LIVENESS = 'liveness',
  PHOTO = 'photo',
  PROOF_OF_HUMANITY = 'proof_of_humanity'
}

/**
 * Verification status
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Verification method
 */
export enum VerificationMethod {
  CODE = 'code',
  LINK = 'link',
  OAUTH = 'oauth',
  DOCUMENT_SCAN = 'document_scan',
  FACE_COMPARISON = 'face_comparison',
  LIVENESS_CHECK = 'liveness_check',
  ZERO_KNOWLEDGE_PROOF = 'zero_knowledge_proof'
}

/**
 * Verification provider
 */
export enum VerificationProvider {
  INTERNAL = 'internal',
  TWILIO = 'twilio',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TWITTER = 'twitter',
  GITHUB = 'github',
  JUMIO = 'jumio',
  ONFIDO = 'onfido',
  IDV = 'idv'
}

/**
 * Verification request
 */
export interface VerificationRequest {
  id: string;
  type: VerificationType;
  method: VerificationMethod;
  provider: VerificationProvider;
  status: VerificationStatus;
  value: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  verifiedAt?: number;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
}

/**
 * Verification result
 */
export interface VerificationResult {
  success: boolean;
  verificationId: string;
  type: VerificationType;
  status: VerificationStatus;
  message?: string;
  score?: number;
  metadata?: Record<string, any>;
}

/**
 * Verification options
 */
export interface VerificationOptions {
  provider?: VerificationProvider;
  method?: VerificationMethod;
  expiry?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
}

/**
 * Verification claim
 */
export interface VerificationClaim {
  id: string;
  type: VerificationType;
  value: string;
  issuedAt: number;
  expiresAt?: number;
  issuer: string;
  subject: string;
  proof: {
    type: string;
    created: number;
    verificationMethod: string;
    proofValue: string;
  };
}

/**
 * Verification service interface
 */
export interface IVerificationService {
  /**
   * Start a verification process
   */
  startVerification(
    type: VerificationType,
    value: string,
    options?: VerificationOptions
  ): Promise<VerificationRequest>;
  
  /**
   * Complete a verification process
   */
  completeVerification(
    verificationId: string,
    code: string
  ): Promise<VerificationResult>;
  
  /**
   * Check verification status
   */
  checkVerificationStatus(
    verificationId: string
  ): Promise<VerificationStatus>;
  
  /**
   * Get all verifications for a user
   */
  getUserVerifications(
    userId: string,
    type?: VerificationType
  ): Promise<VerificationRequest[]>;
  
  /**
   * Create a verification claim
   */
  createVerificationClaim(
    type: VerificationType,
    value: string,
    subject: string,
    expiresIn?: number
  ): Promise<VerificationClaim>;
  
  /**
   * Verify a verification claim
   */
  verifyVerificationClaim(
    claim: VerificationClaim
  ): Promise<boolean>;
  
  /**
   * Revoke a verification
   */
  revokeVerification(
    verificationId: string,
    reason?: string
  ): Promise<boolean>;
}

/**
 * Email verification utility
 */
export class EmailVerification {
  /**
   * Generate a verification code
   */
  static generateVerificationCode(length = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }
  
  /**
   * Generate a verification link
   */
  static generateVerificationLink(baseUrl: string, token: string): string {
    const url = new URL(baseUrl);
    url.searchParams.append('token', token);
    return url.toString();
  }
}

/**
 * Phone verification utility
 */
export class PhoneVerification {
  /**
   * Format a phone number to E.164 standard
   */
  static formatPhoneNumber(phoneNumber: string, countryCode = '1'): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!digits.startsWith(countryCode)) {
      return `+${countryCode}${digits}`;
    } else {
      return `+${digits}`;
    }
  }
  
  /**
   * Validate a phone number
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic validation - in a real implementation would be more sophisticated
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }
}

/**
 * Social verification utility
 */
export class SocialVerification {
  /**
   * Get OAuth URL for a provider
   */
  static getOAuthUrl(provider: VerificationProvider, clientId: string, redirectUri: string, state: string): string {
    switch (provider) {
      case VerificationProvider.GOOGLE:
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&state=${state}`;
      
      case VerificationProvider.FACEBOOK:
        return `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`;
      
      case VerificationProvider.TWITTER:
        return `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=users.read%20tweet.read&state=${state}`;
      
      default:
        throw new Error(`OAuth URL not implemented for provider: ${provider}`);
    }
  }
}

/**
 * Biometric verification utility
 */
export class BiometricVerification {
  /**
   * Compare facial features
   */
  static async compareFaces(faceImage1: Uint8Array, faceImage2: Uint8Array): Promise<{
    match: boolean;
    confidence: number;
    landmarks?: Record<string, { x: number, y: number }>;
  }> {
    // In a real implementation, this would use a facial recognition service
    return {
      match: true,
      confidence: 0.95
    };
  }
  
  /**
   * Perform liveness check
   */
  static async checkLiveness(videoStream: Uint8Array): Promise<{
    isLive: boolean;
    confidence: number;
    blinks?: number;
    headMovements?: number;
  }> {
    // In a real implementation, this would use a liveness detection service
    return {
      isLive: true,
      confidence: 0.92,
      blinks: 3,
      headMovements: 2
    };
  }
}