import { EventEmitter } from 'events';
import { PaymentTransaction } from './PaymentService';

/**
 * Types of resources that can be tracked in the system
 */
export enum ResourceType {
  BANDWIDTH = 'bandwidth',
  STORAGE = 'storage',
  COMPUTATION = 'computation',
  PREMIUM_FEATURE = 'premium_feature',
  VIRTUAL_GIFT = 'virtual_gift',
  BOOST = 'boost',
  CONTENT_ACCESS = 'content_access',
}

/**
 * Resource usage record
 */
export interface ResourceUsage {
  id: string;
  userId: string;
  resourceType: ResourceType;
  amount: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Resource exchange record
 */
export interface ResourceExchange {
  id: string;
  fromUserId: string;
  toUserId: string;
  resourceType: ResourceType;
  amount: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Resource tracker configuration
 */
export interface ResourceTrackerOptions {
  trackBandwidth?: boolean;
  trackStorage?: boolean;
  trackComputation?: boolean;
  enableResourceExchange?: boolean;
  resourceLimits?: Partial<Record<ResourceType, number>>;
}

/**
 * Tracks resource usage and exchanges between users
 */
export class ResourceTracker extends EventEmitter {
  private userResources: Map<string, Map<ResourceType, number>> = new Map();
  private usageHistory: ResourceUsage[] = [];
  private exchangeHistory: ResourceExchange[] = [];
  
  private options: Required<ResourceTrackerOptions> = {
    trackBandwidth: true,
    trackStorage: true,
    trackComputation: true,
    enableResourceExchange: true,
    resourceLimits: {
      [ResourceType.BANDWIDTH]: 1000,     // MB per day
      [ResourceType.STORAGE]: 5000,       // MB
      [ResourceType.COMPUTATION]: 100,     // Compute units
      [ResourceType.PREMIUM_FEATURE]: 10,  // Uses per day
      [ResourceType.VIRTUAL_GIFT]: 50,     // Gifts
      [ResourceType.BOOST]: 5,             // Profile boosts
      [ResourceType.CONTENT_ACCESS]: 20,   // Premium content access
    },
  };
  
  constructor(options: ResourceTrackerOptions = {}) {
    super();
    this.options = {
      ...this.options,
      ...options,
      resourceLimits: {
        ...this.options.resourceLimits,
        ...(options.resourceLimits || {}),
      },
    };
  }
  
  /**
   * Track resource usage for a user
   */
  public trackUsage(
    userId: string,
    resourceType: ResourceType,
    amount: number,
    metadata?: Record<string, any>
  ): void {
    if (amount <= 0) {
      throw new Error('Resource usage amount must be positive');
    }
    
    // Initialize user resources if needed
    if (!this.userResources.has(userId)) {
      this.userResources.set(userId, new Map());
    }
    
    const userResourceMap = this.userResources.get(userId)!;
    
    // Initialize resource type if needed
    if (!userResourceMap.has(resourceType)) {
      userResourceMap.set(resourceType, 0);
    }
    
    // Update resource usage
    const currentUsage = userResourceMap.get(resourceType)!;
    const newUsage = currentUsage + amount;
    
    // Check resource limits
    const limit = this.options.resourceLimits[resourceType];
    if (limit !== undefined && newUsage > limit) {
      throw new Error(`Resource limit exceeded for ${resourceType}: ${newUsage}/${limit}`);
    }
    
    userResourceMap.set(resourceType, newUsage);
    
    // Record usage
    const usageRecord: ResourceUsage = {
      id: this.generateId('usage'),
      userId,
      resourceType,
      amount,
      timestamp: Date.now(),
      metadata,
    };
    
    this.usageHistory.push(usageRecord);
    this.emit('resource:used', usageRecord);
  }
  
  /**
   * Reset usage for a specific resource type
   */
  public resetUsage(userId: string, resourceType: ResourceType): void {
    if (!this.userResources.has(userId)) return;
    
    const userResourceMap = this.userResources.get(userId)!;
    userResourceMap.set(resourceType, 0);
    
    this.emit('resource:reset', userId, resourceType);
  }
  
  /**
   * Get current resource usage for a user
   */
  public getResourceUsage(userId: string, resourceType: ResourceType): number {
    if (!this.userResources.has(userId)) return 0;
    
    const userResourceMap = this.userResources.get(userId)!;
    return userResourceMap.get(resourceType) || 0;
  }
  
  /**
   * Track a resource exchange between users
   */
  public trackExchange(transaction: PaymentTransaction): void {
    if (!this.options.enableResourceExchange) {
      throw new Error('Resource exchange is disabled');
    }
    
    if (!transaction.metadata?.resourceType) {
      throw new Error('Resource type must be specified in transaction metadata');
    }
    
    const resourceType = transaction.metadata.resourceType as ResourceType;
    const amount = transaction.amount;
    
    // Validate resource type
    if (!Object.values(ResourceType).includes(resourceType)) {
      throw new Error(`Invalid resource type: ${resourceType}`);
    }
    
    // Record the exchange
    const exchange: ResourceExchange = {
      id: this.generateId('exchange'),
      fromUserId: transaction.senderId,
      toUserId: transaction.recipientId,
      resourceType,
      amount,
      timestamp: Date.now(),
      metadata: transaction.metadata,
    };
    
    this.exchangeHistory.push(exchange);
    
    // Update resource balances
    this.decreaseResource(transaction.senderId, resourceType, amount);
    this.increaseResource(transaction.recipientId, resourceType, amount);
    
    this.emit('resource:exchanged', exchange);
  }
  
  /**
   * Get resource exchange history for a user
   */
  public getUserExchangeHistory(userId: string): ResourceExchange[] {
    return this.exchangeHistory.filter(
      exchange => exchange.fromUserId === userId || exchange.toUserId === userId
    );
  }
  
  /**
   * Get resource usage history for a user
   */
  public getUserUsageHistory(userId: string): ResourceUsage[] {
    return this.usageHistory.filter(usage => usage.userId === userId);
  }
  
  /**
   * Check if a user has sufficient resources
   */
  public hasEnoughResources(userId: string, resourceType: ResourceType, amount: number): boolean {
    const currentAmount = this.getResourceUsage(userId, resourceType);
    return currentAmount >= amount;
  }
  
  /**
   * Decrease a resource for a user
   */
  private decreaseResource(userId: string, resourceType: ResourceType, amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    const currentAmount = this.getResourceUsage(userId, resourceType);
    if (currentAmount < amount) {
      throw new Error(`Insufficient ${resourceType} resources: ${currentAmount} < ${amount}`);
    }
    
    // Initialize user resources if needed
    if (!this.userResources.has(userId)) {
      this.userResources.set(userId, new Map());
    }
    
    const userResourceMap = this.userResources.get(userId)!;
    userResourceMap.set(resourceType, currentAmount - amount);
    
    this.emit('resource:decreased', userId, resourceType, amount, currentAmount - amount);
  }
  
  /**
   * Increase a resource for a user
   */
  private increaseResource(userId: string, resourceType: ResourceType, amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    // Initialize user resources if needed
    if (!this.userResources.has(userId)) {
      this.userResources.set(userId, new Map());
    }
    
    const userResourceMap = this.userResources.get(userId)!;
    const currentAmount = userResourceMap.get(resourceType) || 0;
    userResourceMap.set(resourceType, currentAmount + amount);
    
    this.emit('resource:increased', userId, resourceType, amount, currentAmount + amount);
  }
  
  /**
   * Generate a unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
