/**
 * User compatibility scoring module
 */

/**
 * Score category
 */
export enum ScoreCategory {
  INTERESTS = 'interests',
  LOCATION = 'location',
  PREFERENCES = 'preferences',
  PERSONALITY = 'personality',
  ACTIVITY = 'activity',
  COMMUNICATION = 'communication'
}

/**
 * Score weights
 */
export interface ScoreWeights {
  [ScoreCategory.INTERESTS]: number;
  [ScoreCategory.LOCATION]: number;
  [ScoreCategory.PREFERENCES]: number;
  [ScoreCategory.PERSONALITY]: number;
  [ScoreCategory.ACTIVITY]: number;
  [ScoreCategory.COMMUNICATION]: number;
}

/**
 * Category score
 */
export interface CategoryScore {
  score: number;
  weight: number;
  details?: Record<string, number>;
}

/**
 * User compatibility score
 */
export interface CompatibilityScore {
  userId1: string;
  userId2: string;
  overallScore: number;
  categories: Record<ScoreCategory, CategoryScore>;
  matchReasons: string[];
  timestamp: number;
}

/**
 * Scoring options
 */
export interface ScoringOptions {
  weights?: Partial<ScoreWeights>;
  preferenceImportance?: number;
  interestMatchThreshold?: number;
  locationMaxDistance?: number;
  minThreshold?: number;
  contextFactors?: Record<string, number>;
  includeDetails?: boolean;
}

/**
 * Scoring service interface
 */
export interface IScoringService {
  /**
   * Initialize the scoring service
   */
  init(options?: ScoringOptions): Promise<void>;
  
  /**
   * Calculate compatibility score between users
   */
  calculateScore(userId1: string, userId2: string, options?: ScoringOptions): Promise<CompatibilityScore>;
  
  /**
   * Calculate category score
   */
  calculateCategoryScore(
    category: ScoreCategory,
    userId1: string,
    userId2: string,
    options?: ScoringOptions
  ): Promise<CategoryScore>;
  
  /**
   * Generate match reasons
   */
  generateMatchReasons(compatibilityScore: CompatibilityScore): string[];
  
  /**
   * Update scoring weights
   */
  updateWeights(weights: Partial<ScoreWeights>): void;
  
  /**
   * Get scoring settings
   */
  getSettings(): ScoringOptions;
}
