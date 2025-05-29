/**
 * Credit system for rewarding user actions
 */

/**
 * Credit transaction type
 */
export enum CreditTransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  REFUND = 'refund',
  EXPIRE = 'expire',
  BONUS = 'bonus',
  GRANT = 'grant'
}

/**
 * Credit earning category
 */
export enum CreditEarningCategory {
  PROFILE_COMPLETION = 'profile_completion',
  VERIFICATION = 'verification',
  DAILY_LOGIN = 'daily_login',
  MESSAGING = 'messaging',
  FEEDBACK = 'feedback',
  REFERRAL = 'referral',
  ENGAGEMENT = 'engagement'
}

/**
 * Credit spending category
 */
export enum CreditSpendingCategory {
  BOOST = 'boost',
  FEATURE_UNLOCK = 'feature_unlock',
  SUBSCRIPTION = 'subscription',
  GIFT = 'gift',
  TIP = 'tip',
  PREMIUM_CONTENT = 'premium_content'
}

/**
 * Credit transaction
 */
export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  balance: number;
  category?: CreditEarningCategory | CreditSpendingCategory;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
}

/**
 * Credit balance
 */
export interface CreditBalance {
  total: number;
  available: number;
  pending: number;
  expiringSoon?: {
    amount: number;
    expiryDate: number;
  };
  lastUpdated: number;
}

/**
 * Credit system configuration
 */
export interface CreditSystemConfig {
  earningRates?: Partial<Record<CreditEarningCategory, number>>;
  spendingRates?: Partial<Record<CreditSpendingCategory, number>>;
  expiryDays?: number;
  startingCredits?: number;
  maxDailyEarnings?: number;
  referralBonus?: number;
}

/**
 * Credit service interface
 */
export interface ICreditService {
  /**
   * Initialize the credit service
   */
  init(config: CreditSystemConfig): Promise<void>;
  
  /**
   * Get user's credit balance
   */
  getBalance(userId: string): Promise<CreditBalance>;
  
  /**
   * Earn credits
   */
  earnCredits(
    userId: string,
    category: CreditEarningCategory,
    metadata?: Record<string, any>
  ): Promise<CreditTransaction>;
  
  /**
   * Spend credits
   */
  spendCredits(
    userId: string,
    amount: number,
    category: CreditSpendingCategory,
    metadata?: Record<string, any>
  ): Promise<CreditTransaction>;
  
  /**
   * Award bonus credits
   */
  awardBonus(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<CreditTransaction>;
  
  /**
   * Refund credits
   */
  refundCredits(
    transactionId: string,
    reason: string
  ): Promise<CreditTransaction>;
  
  /**
   * Get transaction history
   */
  getTransactionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: CreditTransactionType[];
      startDate?: number;
      endDate?: number;
    }
  ): Promise<CreditTransaction[]>;
  
  /**
   * Can user afford an item
   */
  canAfford(userId: string, amount: number): Promise<boolean>;
  
  /**
   * Get credit earning opportunities
   */
  getEarningOpportunities(userId: string): Promise<Array<{
    category: CreditEarningCategory;
    amount: number;
    description: string;
    completed: boolean;
  }>>;
}