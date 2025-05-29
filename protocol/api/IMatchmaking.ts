/**
 * Matchmaking service interface
 */

import { Profile } from './IProfile';

/**
 * Match object representing a potential match between users
 */
export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'matched' | 'rejected' | 'expired' | 'blocked';
  matchType: 'mutual' | 'suggested' | 'boosted' | 'event';
  compatibilityScore?: number;
  matchReasons?: string[];
  user1Action?: {
    action: 'like' | 'superlike' | 'pass' | 'block';
    timestamp: string;
    note?: string;
  };
  user2Action?: {
    action: 'like' | 'superlike' | 'pass' | 'block';
    timestamp: string;
    note?: string;
  };
  conversationId?: string;
  matchedAt: string;
  lastInteractionAt?: string;
  expiresAt?: string;
  metadata?: {
    discoveryContext?: string;
    sharedInterests?: string[];
    sharedConnections?: string[];
    matchAlgorithm?: string;
    matchVersion?: string;
  };
  privacySettings?: {
    hideFromFriends?: boolean;
    hideFromPublic?: boolean;
    anonymousMode?: boolean;
  };
}

/**
 * User data for a match
 */
export interface MatchUser {
  userId: string;
  status: UserMatchStatus;
  seenAt?: Date;
  respondedAt?: Date;
}

/**
 * Status of a match
 */
export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  EXPIRED = 'expired',
  CLOSED = 'closed'
}

/**
 * User's response to a match
 */
export enum UserMatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

/**
 * Match filter options
 */
export interface MatchFilterOptions {
  status?: Match['status'] | Match['status'][];
  matchType?: Match['matchType'] | Match['matchType'][];
  minCompatibilityScore?: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'matchedAt' | 'lastInteractionAt' | 'compatibilityScore';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Match recommendation
 */
export interface MatchRecommendation {
  userId: string;
  profile: Partial<Profile>;
  compatibilityScore: number;
  matchReasons?: string[];
}

/**
 * Discovery options
 */
export interface DiscoveryOptions {
  limit?: number;
  excludeUserIds?: string[];
  includeRejected?: boolean;
  minCompatibilityScore?: number;
  maxDistance?: number;
  boostFactors?: Record<string, number>;
  includeReasons?: boolean;
}

/**
 * Matchmaking service interface
 */
export interface IMatchmakingService {
  /**
   * Get recommended matches for the current user
   * @param limit Maximum number of recommendations
   */
  getRecommendations(limit?: number): Promise<MatchRecommendation[]>;

  /**
   * Respond to a match recommendation
   * @param matchId ID of the match
   * @param accept Whether to accept or reject the match
   */
  respondToMatch(matchId: string, accept: boolean): Promise<Match>;

  /**
   * Get the current user's matches
   * @param filters Optional filters for matches
   */
  getMatches(filters?: MatchFilterOptions): Promise<Match[]>;

  /**
   * Get a specific match by ID
   * @param matchId Match ID to retrieve
   */
  getMatch(matchId: string): Promise<Match>;

  /**
   * Unmatch from an existing match
   * @param matchId Match ID to unmatch from
   */
  unmatch(matchId: string): Promise<boolean>;

  /**
   * Refresh match recommendations
   * @param force Force refresh even if recommendations are recent
   */
  refreshRecommendations(force?: boolean): Promise<boolean>;

  /**
   * Update matching preferences
   * @param preferences New matching preferences
   */
  updatePreferences(preferences: Record<string, any>): Promise<boolean>;

  /**
   * Get match compatibility details
   * @param userId User ID to check compatibility with
   */
  getCompatibilityDetails(userId: string): Promise<{
    score: number;
    details: Record<string, any>;
    commonInterests?: string[];
  }>;
}

/**
 * Matchmaking API interface
 */
export interface IMatchmakingAPI {
  /**
   * Get potential matches for the current user
   */
  discoverMatches(options?: DiscoveryOptions): Promise<Array<{
    userId: string;
    compatibilityScore?: number;
    matchReasons?: string[];
    distance?: number;
    expiresAt?: string;
  }>>;
  
  /**
   * Take action on a potential match
   */
  takeAction(
    userId: string,
    action: 'like' | 'superlike' | 'pass' | 'block',
    note?: string
  ): Promise<{
    match?: Match;
    isNewMatch: boolean;
  }>;
  
  /**
   * Get all matches for the current user
   */
  getMatches(filter?: MatchFilterOptions): Promise<Match[]>;
  
  /**
   * Get a specific match by ID
   */
  getMatch(matchId: string): Promise<Match>;
  
  /**
   * Get a match with a specific user
   */
  getMatchWithUser(userId: string): Promise<Match | null>;
  
  /**
   * Unmatch with a user
   */
  unmatch(matchId: string, reason?: string): Promise<boolean>;
  
  /**
   * Report a match
   */
  reportMatch(matchId: string, reason: string, details?: string): Promise<boolean>;
  
  /**
   * Get compatibility score with a user
   */
  getCompatibilityScore(userId: string): Promise<{
    overallScore: number;
    categoryScores?: Record<string, number>;
    matchReasons?: string[];
  }>;
  
  /**
   * Boost profile visibility
   */
  boostProfile(duration?: number): Promise<{
    active: boolean;
    expiresAt: string;
    remainingBoosts?: number;
  }>;
  
  /**
   * Get match statistics
   */
  getMatchStats(): Promise<{
    totalMatches: number;
    activeMatches: number;
    matchRate: number;
    averageCompatibility: number;
    matchesByType: Record<Match['matchType'], number>;
  }>;
} 