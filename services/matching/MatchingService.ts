/**
 * Matching Service
 * 
 * Orchestrates the matching functionality by coordinating between various
 * components like preference management, compatibility scoring, and privacy-preserving matching.
 */

import { IMatchmakingAPI, MatchCriteria, Match, MatchStatus, MatchingPreferences } from '../../protocol/api/IMatchmaking';
import { Profile } from '../../protocol/api/IProfile';
import { PreferenceManager } from './PreferenceManager';
import { CompatibilityEngine } from './CompatibilityEngine';
import { EventEmitter } from 'events';

export interface MatchingServiceOptions {
  /**
   * Maximum number of potential matches to process at once
   */
  batchSize?: number;
  
  /**
   * Minimum compatibility score threshold (0-1)
   */
  minCompatibilityThreshold?: number;
  
  /**
   * Enable privacy-preserving matching
   */
  enablePrivacyPreservation?: boolean;
  
  /**
   * Enable AI-powered recommendations
   */
  enableAIRecommendations?: boolean;
  
  /**
   * Location radius in kilometers
   */
  defaultLocationRadius?: number;
}

export class MatchingService extends EventEmitter implements IMatchmakingAPI {
  private preferenceManager: PreferenceManager;
  private compatibilityEngine: CompatibilityEngine;
  private options: Required<MatchingServiceOptions>;
  private userId: string;
  
  constructor(userId: string, options: MatchingServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      batchSize: 20,
      minCompatibilityThreshold: 0.5,
      enablePrivacyPreservation: true,
      enableAIRecommendations: false,
      defaultLocationRadius: 50,
      ...options
    };
    
    this.preferenceManager = new PreferenceManager(userId);
    this.compatibilityEngine = new CompatibilityEngine({
      enableAI: this.options.enableAIRecommendations,
      privacyPreserving: this.options.enablePrivacyPreservation
    });
  }
  
  /**
   * Initialize the matching service
   */
  async initialize(): Promise<void> {
    await this.preferenceManager.initialize();
    await this.compatibilityEngine.initialize();
    
    // Set up event listeners for real-time updates
    this.compatibilityEngine.on('new-potential-match', this.handleNewPotentialMatch.bind(this));
  }
  
  /**
   * Get matching preferences for the current user
   */
  async getPreferences(): Promise<MatchingPreferences> {
    return this.preferenceManager.getPreferences();
  }
  
  /**
   * Update matching preferences for the current user
   */
  async updatePreferences(preferences: Partial<MatchingPreferences>): Promise<MatchingPreferences> {
    return this.preferenceManager.updatePreferences(preferences);
  }
  
  /**
   * Get potential matches based on the current user's preferences
   */
  async getPotentialMatches(criteria?: Partial<MatchCriteria>): Promise<Profile[]> {
    const preferences = await this.preferenceManager.getPreferences();
    const mergedCriteria: MatchCriteria = {
      locationRadius: criteria?.locationRadius || preferences.locationRadius || this.options.defaultLocationRadius,
      ageRange: criteria?.ageRange || preferences.ageRange,
      interests: criteria?.interests || preferences.interests,
      limit: criteria?.limit || this.options.batchSize
    };
    
    // Get potential matches from the compatibility engine
    const potentialMatches = await this.compatibilityEngine.findPotentialMatches(
      this.userId,
      mergedCriteria
    );
    
    return potentialMatches;
  }
  
  /**
   * Express interest in a potential match
   */
  async expressInterest(targetUserId: string, interestLevel: 'like' | 'superlike'): Promise<Match> {
    // Record the interest in the compatibility engine
    const match = await this.compatibilityEngine.recordInterest(
      this.userId,
      targetUserId,
      interestLevel
    );
    
    // If this created a mutual match, emit an event
    if (match.status === 'matched') {
      this.emit('new-match', match);
    }
    
    return match;
  }
  
  /**
   * Pass on a potential match
   */
  async passOnMatch(targetUserId: string): Promise<void> {
    await this.compatibilityEngine.recordPass(this.userId, targetUserId);
  }
  
  /**
   * Get all matches with their current status
   */
  async getMatches(status?: MatchStatus): Promise<Match[]> {
    return this.compatibilityEngine.getMatches(this.userId, status);
  }
  
  /**
   * Get a specific match by ID
   */
  async getMatch(matchId: string): Promise<Match> {
    return this.compatibilityEngine.getMatch(matchId);
  }
  
  /**
   * Unmatch with a user
   */
  async unmatch(matchId: string, reason?: string): Promise<void> {
    await this.compatibilityEngine.unmatch(matchId, reason);
    this.emit('unmatched', { matchId, userId: this.userId, reason });
  }
  
  /**
   * Report a user
   */
  async reportUser(targetUserId: string, reason: string, details?: string): Promise<void> {
    await this.compatibilityEngine.reportUser(this.userId, targetUserId, reason, details);
    
    // Automatically unmatch and block the user
    const match = await this.compatibilityEngine.findMatchByUsers(this.userId, targetUserId);
    if (match) {
      await this.unmatch(match.id, 'user_reported');
    }
    
    // Block the user
    await this.blockUser(targetUserId);
  }
  
  /**
   * Block a user
   */
  async blockUser(targetUserId: string): Promise<void> {
    await this.preferenceManager.addBlockedUser(targetUserId);
    
    // Find and remove any existing match
    const match = await this.compatibilityEngine.findMatchByUsers(this.userId, targetUserId);
    if (match) {
      await this.unmatch(match.id, 'user_blocked');
    }
    
    this.emit('user-blocked', { userId: this.userId, blockedUserId: targetUserId });
  }
  
  /**
   * Unblock a user
   */
  async unblockUser(targetUserId: string): Promise<void> {
    await this.preferenceManager.removeBlockedUser(targetUserId);
    this.emit('user-unblocked', { userId: this.userId, unblockedUserId: targetUserId });
  }
  
  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<string[]> {
    return this.preferenceManager.getBlockedUsers();
  }
  
  /**
   * Calculate compatibility score between two users
   */
  async calculateCompatibility(targetUserId: string): Promise<number> {
    return this.compatibilityEngine.calculateCompatibilityScore(this.userId, targetUserId);
  }
  
  /**
   * Get shared interests with another user
   */
  async getSharedInterests(targetUserId: string): Promise<string[]> {
    return this.compatibilityEngine.getSharedInterests(this.userId, targetUserId);
  }
  
  /**
   * Handle new potential match event
   */
  private handleNewPotentialMatch(match: Profile): void {
    this.emit('potential-match', match);
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
    await this.compatibilityEngine.dispose();
  }
}
