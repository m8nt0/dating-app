/**
 * Compatibility Engine
 * 
 * Handles compatibility scoring, match finding, and interest recording
 * between users in the dating app.
 */

import { EventEmitter } from 'events';
import { Match, MatchStatus } from '../../protocol/api/IMatchmaking';
import { Profile } from '../../protocol/api/IProfile';
import { StorageManager } from '../../core/storage/indexeddb';

export interface CompatibilityEngineOptions {
  /**
   * Enable AI-powered recommendations
   */
  enableAI?: boolean;
  
  /**
   * Enable privacy-preserving matching
   */
  privacyPreserving?: boolean;
  
  /**
   * Weights for different compatibility factors
   */
  weights?: {
    interests: number;
    location: number;
    demographics: number;
    personality: number;
    preferences: number;
  };
}

export interface MatchCriteria {
  locationRadius: number;
  ageRange?: { min: number; max: number };
  interests?: string[];
  limit?: number;
}

export class CompatibilityEngine extends EventEmitter {
  private storage: StorageManager;
  private options: Required<CompatibilityEngineOptions>;
  private readonly MATCHES_STORE = 'matches';
  private readonly INTEREST_STORE = 'interests';
  private readonly REPORTS_STORE = 'reports';
  
  constructor(options: CompatibilityEngineOptions = {}) {
    super();
    this.options = {
      enableAI: false,
      privacyPreserving: true,
      weights: {
        interests: 0.3,
        location: 0.2,
        demographics: 0.1,
        personality: 0.25,
        preferences: 0.15,
        ...options.weights
      },
      ...options
    };
    
    this.storage = new StorageManager('compatibility');
  }
  
  /**
   * Initialize the compatibility engine
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
  }
  
  /**
   * Find potential matches for a user based on criteria
   */
  async findPotentialMatches(userId: string, criteria: MatchCriteria): Promise<Profile[]> {
    // In a real implementation, this would query a database or network
    // For now, we'll simulate with a mock implementation
    
    // Get user profile from storage or API
    const userProfile = await this.getUserProfile(userId);
    
    // Get potential matches (in a real app, this would be from a database query)
    const potentialMatches = await this.fetchPotentialMatches(userProfile, criteria);
    
    // Calculate compatibility scores for each potential match
    const scoredMatches = await Promise.all(
      potentialMatches.map(async (profile) => {
        const score = await this.calculateCompatibilityScore(userId, profile.id!);
        return { profile, score };
      })
    );
    
    // Sort by compatibility score and return profiles
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .map(match => match.profile);
  }
  
  /**
   * Record interest in another user
   */
  async recordInterest(
    userId: string,
    targetUserId: string,
    interestLevel: 'like' | 'superlike'
  ): Promise<Match> {
    // Store the interest
    const interest = {
      userId,
      targetUserId,
      level: interestLevel,
      timestamp: new Date().toISOString()
    };
    
    await this.storage.add(`${this.INTEREST_STORE}:${userId}`, interest);
    
    // Check if the target user has already expressed interest
    const targetInterests = await this.storage.getAll(`${this.INTEREST_STORE}:${targetUserId}`);
    const mutualInterest = targetInterests.find((i: any) => i.targetUserId === userId);
    
    if (mutualInterest) {
      // Create a match
      const match: Match = {
        id: `match_${Date.now()}_${userId}_${targetUserId}`,
        users: [userId, targetUserId],
        status: 'matched',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interestLevel: {
          [userId]: interestLevel,
          [targetUserId]: mutualInterest.level
        }
      };
      
      await this.storage.set(`${this.MATCHES_STORE}:${match.id}`, match);
      return match;
    } else {
      // Create a pending match
      const match: Match = {
        id: `match_${Date.now()}_${userId}_${targetUserId}`,
        users: [userId, targetUserId],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interestLevel: {
          [userId]: interestLevel
        }
      };
      
      await this.storage.set(`${this.MATCHES_STORE}:${match.id}`, match);
      return match;
    }
  }
  
  /**
   * Record a pass on another user
   */
  async recordPass(userId: string, targetUserId: string): Promise<void> {
    const pass = {
      userId,
      targetUserId,
      timestamp: new Date().toISOString()
    };
    
    await this.storage.add(`passes:${userId}`, pass);
  }
  
  /**
   * Get matches for a user with optional status filter
   */
  async getMatches(userId: string, status?: MatchStatus): Promise<Match[]> {
    const allMatches = await this.storage.getAllByPrefix(this.MATCHES_STORE);
    
    return allMatches
      .filter((match: Match) => 
        match.users.includes(userId) && 
        (status ? match.status === status : true)
      )
      .sort((a: Match, b: Match) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
  
  /**
   * Get a specific match by ID
   */
  async getMatch(matchId: string): Promise<Match> {
    const match = await this.storage.get(`${this.MATCHES_STORE}:${matchId}`);
    if (!match) {
      throw new Error(`Match not found: ${matchId}`);
    }
    return match as Match;
  }
  
  /**
   * Find a match between two specific users
   */
  async findMatchByUsers(userId1: string, userId2: string): Promise<Match | null> {
    const allMatches = await this.storage.getAllByPrefix(this.MATCHES_STORE);
    
    const match = allMatches.find((m: Match) => 
      m.users.includes(userId1) && m.users.includes(userId2)
    );
    
    return match || null;
  }
  
  /**
   * Unmatch two users
   */
  async unmatch(matchId: string, reason?: string): Promise<void> {
    const match = await this.getMatch(matchId);
    
    match.status = 'unmatched';
    match.updatedAt = new Date().toISOString();
    match.unmatchReason = reason;
    
    await this.storage.set(`${this.MATCHES_STORE}:${matchId}`, match);
  }
  
  /**
   * Report a user
   */
  async reportUser(
    reporterId: string,
    targetUserId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    const report = {
      reporterId,
      targetUserId,
      reason,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    await this.storage.add(this.REPORTS_STORE, report);
  }
  
  /**
   * Calculate compatibility score between two users
   */
  async calculateCompatibilityScore(userId1: string, userId2: string): Promise<number> {
    const profile1 = await this.getUserProfile(userId1);
    const profile2 = await this.getUserProfile(userId2);
    
    if (!profile1 || !profile2) {
      return 0;
    }
    
    // Calculate interest similarity
    const interestScore = this.calculateInterestSimilarity(profile1, profile2);
    
    // Calculate location proximity
    const locationScore = this.calculateLocationProximity(profile1, profile2);
    
    // Calculate demographic compatibility
    const demographicScore = this.calculateDemographicCompatibility(profile1, profile2);
    
    // Calculate personality compatibility
    const personalityScore = this.calculatePersonalityCompatibility(profile1, profile2);
    
    // Calculate preference alignment
    const preferenceScore = this.calculatePreferenceAlignment(profile1, profile2);
    
    // Weighted average
    const { weights } = this.options;
    const weightSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    const score = (
      interestScore * weights.interests +
      locationScore * weights.location +
      demographicScore * weights.demographics +
      personalityScore * weights.personality +
      preferenceScore * weights.preferences
    ) / weightSum;
    
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Get shared interests between two users
   */
  async getSharedInterests(userId1: string, userId2: string): Promise<string[]> {
    const profile1 = await this.getUserProfile(userId1);
    const profile2 = await this.getUserProfile(userId2);
    
    if (!profile1?.interests || !profile2?.interests) {
      return [];
    }
    
    return profile1.interests.filter(interest => 
      profile2.interests?.includes(interest)
    );
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
  }
  
  // Private helper methods
  
  private async getUserProfile(userId: string): Promise<Profile> {
    // In a real implementation, this would fetch from a database or API
    // For now, we'll return a mock profile
    return {
      id: userId,
      username: `user_${userId}`,
      displayName: `User ${userId}`,
      bio: `This is user ${userId}'s bio`,
      interests: ['music', 'movies', 'travel', 'food'],
      location: {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        city: 'Sample City',
        country: 'Sample Country'
      },
      dateOfBirth: new Date(1990, 0, 1).toISOString(),
      gender: 'other',
      photos: [
        {
          id: `photo1_${userId}`,
          url: `https://example.com/photos/${userId}_1.jpg`,
          isPrimary: true
        }
      ]
    };
  }
  
  private async fetchPotentialMatches(userProfile: Profile, criteria: MatchCriteria): Promise<Profile[]> {
    // In a real implementation, this would query a database or network
    // For now, we'll return mock profiles
    const mockProfiles: Profile[] = [];
    
    for (let i = 0; i < (criteria.limit || 10); i++) {
      const id = `user_${Math.floor(Math.random() * 10000)}`;
      
      mockProfiles.push({
        id,
        username: `user_${id}`,
        displayName: `User ${id}`,
        bio: `This is user ${id}'s bio`,
        interests: ['music', 'movies', 'travel', 'food'].filter(() => Math.random() > 0.3),
        location: {
          latitude: userProfile.location?.latitude! + (Math.random() * 2 - 1),
          longitude: userProfile.location?.longitude! + (Math.random() * 2 - 1),
          city: 'Nearby City',
          country: userProfile.location?.country
        },
        dateOfBirth: new Date(1985 + Math.floor(Math.random() * 15), 
                             Math.floor(Math.random() * 12), 
                             Math.floor(Math.random() * 28) + 1).toISOString(),
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
        photos: [
          {
            id: `photo1_${id}`,
            url: `https://example.com/photos/${id}_1.jpg`,
            isPrimary: true
          }
        ]
      });
    }
    
    return mockProfiles;
  }
  
  private calculateInterestSimilarity(profile1: Profile, profile2: Profile): number {
    if (!profile1.interests || !profile2.interests || 
        profile1.interests.length === 0 || profile2.interests.length === 0) {
      return 0.5; // Neutral score if no interests
    }
    
    const interests1 = new Set(profile1.interests);
    const interests2 = new Set(profile2.interests);
    
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }
  
  private calculateLocationProximity(profile1: Profile, profile2: Profile): number {
    if (!profile1.location || !profile2.location || 
        !profile1.location.latitude || !profile1.location.longitude || 
        !profile2.location.latitude || !profile2.location.longitude) {
      return 0.5; // Neutral score if no location
    }
    
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      profile1.location.latitude,
      profile1.location.longitude,
      profile2.location.latitude,
      profile2.location.longitude
    );
    
    // Convert distance to a score (closer = higher score)
    // Max score at 0km, min score at 100km
    return Math.max(0, 1 - distance / 100);
  }
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  private calculateDemographicCompatibility(profile1: Profile, profile2: Profile): number {
    // In a real implementation, this would consider age difference, education, etc.
    // For now, return a simple random score
    return 0.7;
  }
  
  private calculatePersonalityCompatibility(profile1: Profile, profile2: Profile): number {
    // In a real implementation, this would compare personality traits
    // For now, return a simple random score
    return 0.6;
  }
  
  private calculatePreferenceAlignment(profile1: Profile, profile2: Profile): number {
    // In a real implementation, this would check if each user matches the other's preferences
    // For now, return a simple random score
    return 0.8;
  }
}
