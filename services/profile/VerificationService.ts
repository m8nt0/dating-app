/**
 * Verification Service
 * 
 * Handles user identity verification processes including photo verification,
 * document verification, and other verification methods.
 */

import { EventEmitter } from 'events';
import { StorageManager } from '../../core/storage/indexeddb';

export type VerificationType = 'photo' | 'document' | 'phone' | 'email' | 'social';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationRequest {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: string;
  updatedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

export interface VerificationServiceOptions {
  /**
   * Available verification types
   */
  availableVerificationTypes?: VerificationType[];
  
  /**
   * Automatic verification (for testing)
   */
  autoVerify?: boolean;
  
  /**
   * Verification expiration in days
   */
  verificationExpirationDays?: number;
}

export class VerificationService extends EventEmitter {
  private userId: string;
  private storage: StorageManager;
  private options: Required<VerificationServiceOptions>;
  private activeRequests: Map<VerificationType, VerificationRequest> = new Map();
  
  constructor(userId: string, options: VerificationServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      availableVerificationTypes: ['photo', 'document', 'phone', 'email', 'social'],
      autoVerify: false,
      verificationExpirationDays: 365, // 1 year
      ...options
    };
    
    this.storage = new StorageManager('verification');
  }
  
  /**
   * Initialize the verification service
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.loadActiveRequests();
  }
  
  /**
   * Start a verification process
   */
  async startVerification(
    type: VerificationType = 'photo',
    metadata?: Record<string, any>
  ): Promise<VerificationRequest> {
    // Check if verification type is available
    if (!this.options.availableVerificationTypes.includes(type)) {
      throw new Error(`Verification type ${type} is not available`);
    }
    
    // Check if there's already an active request of this type
    const existingRequest = this.activeRequests.get(type);
    if (existingRequest && ['pending', 'verified'].includes(existingRequest.status)) {
      return existingRequest;
    }
    
    // Create a new verification request
    const now = new Date().toISOString();
    const request: VerificationRequest = {
      id: `verification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: this.userId,
      type,
      status: 'pending',
      submittedAt: now,
      updatedAt: now,
      metadata
    };
    
    // Save the request
    await this.saveVerificationRequest(request);
    
    // Auto-verify if enabled (for testing)
    if (this.options.autoVerify) {
      await this.simulateVerification(request.id);
    }
    
    // Emit event
    this.emit('verification-started', { userId: this.userId, type, requestId: request.id });
    
    return request;
  }
  
  /**
   * Get verification status for a specific type
   */
  async getVerificationStatus(type: VerificationType): Promise<VerificationStatus> {
    const request = this.activeRequests.get(type);
    return request ? request.status : 'unverified';
  }
  
  /**
   * Get all verification statuses
   */
  async getAllVerificationStatuses(): Promise<Record<VerificationType, VerificationStatus>> {
    const result: Partial<Record<VerificationType, VerificationStatus>> = {};
    
    for (const type of this.options.availableVerificationTypes) {
      result[type] = await this.getVerificationStatus(type);
    }
    
    return result as Record<VerificationType, VerificationStatus>;
  }
  
  /**
   * Check if the user is verified for a specific type
   */
  async isVerified(type: VerificationType): Promise<boolean> {
    const status = await this.getVerificationStatus(type);
    return status === 'verified';
  }
  
  /**
   * Check if the user is verified for all required types
   */
  async isFullyVerified(requiredTypes: VerificationType[] = ['photo']): Promise<boolean> {
    for (const type of requiredTypes) {
      if (!(await this.isVerified(type))) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Submit verification data
   */
  async submitVerificationData(
    type: VerificationType,
    data: any,
    metadata?: Record<string, any>
  ): Promise<VerificationRequest> {
    // Get or create a verification request
    let request = this.activeRequests.get(type);
    
    if (!request || ['rejected', 'unverified'].includes(request.status)) {
      request = await this.startVerification(type);
    }
    
    // Update the request with the new data
    request.metadata = {
      ...request.metadata,
      ...metadata,
      data
    };
    request.updatedAt = new Date().toISOString();
    
    // Save the updated request
    await this.saveVerificationRequest(request);
    
    // Emit event
    this.emit('verification-data-submitted', { 
      userId: this.userId, 
      type, 
      requestId: request.id 
    });
    
    // Auto-verify if enabled (for testing)
    if (this.options.autoVerify) {
      await this.simulateVerification(request.id);
    }
    
    return request;
  }
  
  /**
   * Cancel a verification request
   */
  async cancelVerification(type: VerificationType): Promise<void> {
    const request = this.activeRequests.get(type);
    
    if (!request || request.status !== 'pending') {
      return;
    }
    
    // Remove the request
    this.activeRequests.delete(type);
    await this.storage.delete(`verification:${this.userId}:${type}`);
    
    // Emit event
    this.emit('verification-cancelled', { userId: this.userId, type, requestId: request.id });
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
  }
  
  // Private helper methods
  
  /**
   * Load active verification requests from storage
   */
  private async loadActiveRequests(): Promise<void> {
    try {
      const requests = await this.storage.getAllByPrefix(`verification:${this.userId}:`);
      
      for (const request of requests) {
        this.activeRequests.set(request.type, request);
      }
      
      // Check for expired verifications
      this.checkForExpiredVerifications();
    } catch (error) {
      console.error('Failed to load verification requests:', error);
    }
  }
  
  /**
   * Save a verification request to storage
   */
  private async saveVerificationRequest(request: VerificationRequest): Promise<void> {
    // Update the active requests map
    this.activeRequests.set(request.type, request);
    
    // Save to storage
    await this.storage.set(`verification:${this.userId}:${request.type}`, request);
  }
  
  /**
   * Check for expired verifications
   */
  private checkForExpiredVerifications(): void {
    const now = new Date();
    const expirationMs = this.options.verificationExpirationDays * 24 * 60 * 60 * 1000;
    
    for (const [type, request] of this.activeRequests.entries()) {
      if (request.status === 'verified' && request.verifiedAt) {
        const verifiedAt = new Date(request.verifiedAt);
        const expiresAt = new Date(verifiedAt.getTime() + expirationMs);
        
        if (now > expiresAt) {
          // Verification has expired
          this.activeRequests.delete(type);
          this.storage.delete(`verification:${this.userId}:${type}`);
          
          // Emit event
          this.emit('verification-expired', { 
            userId: this.userId, 
            type, 
            requestId: request.id 
          });
        }
      }
    }
  }
  
  /**
   * Simulate verification (for testing)
   */
  private async simulateVerification(requestId: string): Promise<void> {
    // Find the request
    let foundRequest: VerificationRequest | undefined;
    let foundType: VerificationType | undefined;
    
    for (const [type, request] of this.activeRequests.entries()) {
      if (request.id === requestId) {
        foundRequest = request;
        foundType = type;
        break;
      }
    }
    
    if (!foundRequest || !foundType) {
      return;
    }
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the request
    const now = new Date().toISOString();
    foundRequest.status = 'verified';
    foundRequest.updatedAt = now;
    foundRequest.verifiedAt = now;
    
    // Save the updated request
    await this.saveVerificationRequest(foundRequest);
    
    // Emit event
    this.emit('verification-completed', { 
      userId: this.userId, 
      type: foundType, 
      requestId: foundRequest.id 
    });
  }
}
