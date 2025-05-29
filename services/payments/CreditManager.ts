import { EventEmitter } from 'events';

/**
 * Credit transaction types
 */
export enum CreditTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  EXPIRATION = 'expiration',
}

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  timestamp: number;
  relatedUserId?: string;
  metadata?: Record<string, any>;
}

/**
 * Options for the credit tracker
 */
export interface CreditTrackerOptions {
  initialCreditAmount?: number;
  enableExpiringCredits?: boolean;
  creditExpirationDays?: number;
  enableRewards?: boolean;
}

/**
 * Manages the in-app credit system for users
 */
export class CreditTracker extends EventEmitter {
  private userBalances: Map<string, number> = new Map();
  private transactions: CreditTransaction[] = [];
  private expiringCredits: Map<string, Array<{ amount: number; expiresAt: number }>> = new Map();
  
  private options: Required<CreditTrackerOptions> = {
    initialCreditAmount: 100,
    enableExpiringCredits: true,
    creditExpirationDays: 90,
    enableRewards: true,
  };
  
  constructor(options: CreditTrackerOptions = {}) {
    super();
    this.options = { ...this.options, ...options };
    
    // Set up expiration check timer if enabled
    if (this.options.enableExpiringCredits) {
      setInterval(() => this.checkExpiringCredits(), 3600000); // Check every hour
    }
  }
  
  /**
   * Get a user's current credit balance
   */
  public getBalance(userId: string): number {
    // Initialize balance if not exists
    if (!this.userBalances.has(userId)) {
      this.userBalances.set(userId, this.options.initialCreditAmount);
      
      // Record initial credit transaction
      if (this.options.initialCreditAmount > 0) {
        this.recordTransaction({
          id: this.generateTransactionId(),
          userId,
          type: CreditTransactionType.DEPOSIT,
          amount: this.options.initialCreditAmount,
          timestamp: Date.now(),
          metadata: { reason: 'initial_credits' },
        });
        
        // Add to expiring credits if enabled
        if (this.options.enableExpiringCredits) {
          this.addExpiringCredits(userId, this.options.initialCreditAmount);
        }
      }
    }
    
    return this.userBalances.get(userId) || 0;
  }
  
  /**
   * Add credits to a user's account
   */
  public addCredits(userId: string, amount: number, metadata?: Record<string, any>): number {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    
    // Get current balance (initializes if needed)
    const currentBalance = this.getBalance(userId);
    const newBalance = currentBalance + amount;
    
    // Update balance
    this.userBalances.set(userId, newBalance);
    
    // Record transaction
    this.recordTransaction({
      id: this.generateTransactionId(),
      userId,
      type: CreditTransactionType.DEPOSIT,
      amount,
      timestamp: Date.now(),
      metadata,
    });
    
    // Add to expiring credits if enabled
    if (this.options.enableExpiringCredits) {
      this.addExpiringCredits(userId, amount);
    }
    
    this.emit('credits:added', userId, amount, newBalance);
    return newBalance;
  }
  
  /**
   * Remove credits from a user's account
   */
  public removeCredits(userId: string, amount: number, type: CreditTransactionType = CreditTransactionType.WITHDRAWAL, metadata?: Record<string, any>): number {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    
    // Get current balance (initializes if needed)
    const currentBalance = this.getBalance(userId);
    
    // Check if user has enough credits
    if (currentBalance < amount) {
      throw new Error(`Insufficient credits: ${currentBalance} available, ${amount} required`);
    }
    
    const newBalance = currentBalance - amount;
    
    // Update balance
    this.userBalances.set(userId, newBalance);
    
    // Record transaction
    this.recordTransaction({
      id: this.generateTransactionId(),
      userId,
      type,
      amount: -amount, // Negative amount for removal
      timestamp: Date.now(),
      metadata,
    });
    
    this.emit('credits:removed', userId, amount, newBalance);
    return newBalance;
  }
  
  /**
   * Transfer credits from one user to another
   */
  public transferCredits(fromUserId: string, toUserId: string, amount: number, metadata?: Record<string, any>): void {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }
    
    // Remove from sender
    this.removeCredits(fromUserId, amount, CreditTransactionType.TRANSFER, {
      ...metadata,
      transferTo: toUserId,
    });
    
    // Add to recipient
    this.addCredits(toUserId, amount, {
      ...metadata,
      transferFrom: fromUserId,
    });
    
    this.emit('credits:transferred', fromUserId, toUserId, amount);
  }
  
  /**
   * Award bonus credits to a user
   */
  public awardBonusCredits(userId: string, amount: number, reason: string): number {
    if (!this.options.enableRewards) {
      throw new Error('Rewards are disabled');
    }
    
    return this.addCredits(userId, amount, {
      reason,
      isBonus: true,
    });
  }
  
  /**
   * Get transaction history for a user
   */
  public getUserTransactionHistory(userId: string): CreditTransaction[] {
    return this.transactions.filter(tx => 
      tx.userId === userId || tx.relatedUserId === userId
    );
  }
  
  /**
   * Record a credit transaction
   */
  private recordTransaction(transaction: CreditTransaction): void {
    this.transactions.push(transaction);
    this.emit('transaction:recorded', transaction);
  }
  
  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Add credits to the expiring credits pool for a user
   */
  private addExpiringCredits(userId: string, amount: number): void {
    if (!this.options.enableExpiringCredits) return;
    
    const expiresAt = Date.now() + (this.options.creditExpirationDays * 24 * 60 * 60 * 1000);
    
    if (!this.expiringCredits.has(userId)) {
      this.expiringCredits.set(userId, []);
    }
    
    const userExpiringCredits = this.expiringCredits.get(userId)!;
    userExpiringCredits.push({ amount, expiresAt });
  }
  
  /**
   * Check for expired credits and remove them
   */
  private checkExpiringCredits(): void {
    const now = Date.now();
    
    this.expiringCredits.forEach((credits, userId) => {
      const expiredCredits = credits.filter(credit => credit.expiresAt <= now);
      
      if (expiredCredits.length > 0) {
        // Calculate total expired amount
        const totalExpired = expiredCredits.reduce((sum, credit) => sum + credit.amount, 0);
        
        // Remove expired credits from the list
        this.expiringCredits.set(
          userId,
          credits.filter(credit => credit.expiresAt > now)
        );
        
        // Deduct from user balance
        const currentBalance = this.userBalances.get(userId) || 0;
        const newBalance = Math.max(0, currentBalance - totalExpired);
        this.userBalances.set(userId, newBalance);
        
        // Record expiration transaction
        this.recordTransaction({
          id: this.generateTransactionId(),
          userId,
          type: CreditTransactionType.EXPIRATION,
          amount: -totalExpired,
          timestamp: now,
          metadata: { reason: 'credits_expired' },
        });
        
        this.emit('credits:expired', userId, totalExpired, newBalance);
      }
    });
  }
}
