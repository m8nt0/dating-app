// Match storage and retrieval

import { Match, MatchStatus } from '../entities/Match';
import { UserId } from '../value-objects/UserId';
import { Phase } from '../value-objects/PhaseStatus';

export interface MatchSearchCriteria {
  userId?: UserId;
  status?: MatchStatus;
  phase?: Phase;
  minCompatibility?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface IMatchRepository {
  save(match: Match): Promise<void>;
  findById(id: string): Promise<Match | null>;
  delete(id: string): Promise<void>;
  update(match: Match): Promise<void>;
  
  // Search and filtering
  search(criteria: MatchSearchCriteria): Promise<Match[]>;
  findByUser(userId: UserId): Promise<Match[]>;
  findByStatus(status: MatchStatus): Promise<Match[]>;
  findByPhase(phase: Phase): Promise<Match[]>;
  
  // Status-based queries
  findPendingMatches(userId: UserId): Promise<Match[]>;
  findMutualMatches(userId: UserId): Promise<Match[]>;
  findExpiredMatches(): Promise<Match[]>;
  
  // Analytics and reporting
  getMatchCount(): Promise<number>;
  getMatchCountByStatus(): Promise<Record<MatchStatus, number>>;
  getMatchCountByPhase(): Promise<Record<Phase, number>>;
  getAverageMatchDuration(): Promise<number>;
  getSuccessRate(): Promise<number>;
  
  // Compatibility analysis
  findHighestCompatibilityMatches(limit?: number): Promise<Match[]>;
  getAverageCompatibilityScore(): Promise<number>;
  getCompatibilityDistribution(): Promise<Record<string, number>>;
  
  // Batch operations
  saveMany(matches: Match[]): Promise<void>;
  findManyByIds(ids: string[]): Promise<Match[]>;
  deleteMany(ids: string[]): Promise<void>;
  
  // Time-based queries
  findRecentMatches(
    userId: UserId,
    hours?: number
  ): Promise<Match[]>;
  
  findInactiveMatches(
    thresholdHours: number
  ): Promise<Match[]>;
  
  // Advanced analytics
  getMatchingPatterns(): Promise<any>; // Returns patterns in successful matches
  getCompatibilityTrends(): Promise<any>; // Returns trends in compatibility scores
  getUserMatchingHistory(userId: UserId): Promise<any>; // Returns detailed matching history
} 