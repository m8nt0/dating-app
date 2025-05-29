/**
 * User compatibility algorithms
 */

import { CompatibilityScore, ScoreCategory } from './scoring';

/**
 * Compatibility algorithm type
 */
export enum CompatibilityAlgorithm {
  BASIC = 'basic',
  WEIGHTED = 'weighted',
  MACHINE_LEARNING = 'machine_learning',
  HYBRID = 'hybrid'
}

/**
 * Compatibility factor
 */
export interface CompatibilityFactor {
  id: string;
  name: string;
  category: ScoreCategory;
  weight: number;
  matcher: (user1: any, user2: any) => number;
  description?: string;
}

/**
 * Distance calculation method
 */
export enum DistanceMethod {
  HAVERSINE = 'haversine',
  MANHATTAN = 'manhattan',
  EUCLIDEAN = 'euclidean'
}

/**
 * Compatibility configuration
 */
export interface CompatibilityConfig {
  algorithm: CompatibilityAlgorithm;
  factors?: CompatibilityFactor[];
  minCompatibilityThreshold?: number;
  distanceMethod?: DistanceMethod;
  customWeights?: Record<string, number>;
  considerDealbreakers?: boolean;
  boostFactors?: Array<{
    factor: string;
    multiplier: number;
    condition: (user1: any, user2: any) => boolean;
  }>;
}

/**
 * Compatibility service interface
 */
export interface ICompatibilityService {
  /**
   * Initialize the compatibility service
   */
  init(config: CompatibilityConfig): Promise<void>;
  
  /**
   * Calculate compatibility between users
   */
  calculateCompatibility(userId1: string, userId2: string): Promise<CompatibilityScore>;
  
  /**
   * Get compatibility factors
   */
  getCompatibilityFactors(): CompatibilityFactor[];
  
  /**
   * Register a new compatibility factor
   */
  registerFactor(factor: CompatibilityFactor): void;
  
  /**
   * Update factor weights
   */
  updateFactorWeights(factorWeights: Record<string, number>): void;
  
  /**
   * Calculate distance between users
   */
  calculateDistance(
    location1: { latitude: number; longitude: number },
    location2: { latitude: number; longitude: number },
    method?: DistanceMethod
  ): number;
  
  /**
   * Find users compatible with a given user
   */
  findCompatibleUsers(userId: string, minScore?: number, limit?: number): Promise<Array<{
    userId: string;
    score: CompatibilityScore;
  }>>;
}
