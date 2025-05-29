/**
 * AI recommendation engine
 */

import { CompatibilityScore } from './scoring';

/**
 * Recommendation algorithm
 */
export enum RecommendationAlgorithm {
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  HYBRID = 'hybrid',
  CONTEXTUAL = 'contextual',
  NEURAL_NETWORK = 'neural_network'
}

/**
 * Recommendation options
 */
export interface RecommendationOptions {
  algorithm: RecommendationAlgorithm;
  limit?: number;
  minCompatibilityScore?: number;
  diversityFactor?: number;
  includeRejected?: boolean;
  freshnessFactor?: number;
  contextFactors?: Record<string, any>;
  userFeedbackWeight?: number;
}

/**
 * Recommendation result
 */
export interface Recommendation {
  userId: string;
  score: number;
  compatibilityScore?: CompatibilityScore;
  reasons: string[];
  features?: Record<string, number>;
  confidence: number;
}

/**
 * User feedback
 */
export interface UserFeedback {
  recommendationId: string;
  userId: string;
  targetUserId: string;
  action: 'like' | 'dislike' | 'superlike' | 'ignore';
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Recommendation service interface
 */
export interface IRecommendationService {
  /**
   * Initialize the recommendation service
   */
  init(options: RecommendationOptions): Promise<void>;
  
  /**
   * Get recommendations for a user
   */
  getRecommendations(userId: string, options?: Partial<RecommendationOptions>): Promise<Recommendation[]>;
  
  /**
   * Get a specific recommendation
   */
  getRecommendation(userId: string, targetUserId: string): Promise<Recommendation | null>;
  
  /**
   * Train the recommendation model
   */
  trainModel(options?: { fullRetraining?: boolean }): Promise<void>;
  
  /**
   * Record user feedback
   */
  recordFeedback(feedback: UserFeedback): Promise<void>;
  
  /**
   * Get recommendation explanation
   */
  explainRecommendation(userId: string, recommendedUserId: string): Promise<{
    reasons: string[];
    featureImportance: Record<string, number>;
  }>;
  
  /**
   * Update recommendation algorithm
   */
  updateAlgorithm(algorithm: RecommendationAlgorithm): Promise<void>;
  
  /**
   * Get recommendation metrics
   */
  getMetrics(): Promise<{
    precision: number;
    recall: number;
    diversity: number;
    coverage: number;
  }>;
}