/**
 * Resource management interface
 */

/**
 * Resource API interface
 */

/**
 * Resource type
 */
export enum ResourceType {
  SWIPE = 'swipe',
  BOOST = 'boost',
  SUPERLIKE = 'superlike',
  MESSAGE = 'message',
  VIDEO_CALL = 'video_call',
  PROFILE_VIEW = 'profile_view',
  FEATURE = 'feature',
  STORAGE = 'storage',
  BANDWIDTH = 'bandwidth'
}

/**
 * Resource renewal periods
 */
export enum RenewalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NONE = 'none'
}

/**
 * Resource object representing tracked resources
 */
export interface Resource {
  id: string;
  userId: string;
  type: ResourceType;
  limits: ResourceLimits;
  usage: ResourceUsage;
  renewal?: ResourceRenewal;
  tier?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

/**
 * Resource limits
 */
export interface ResourceLimits {
  daily?: number;
  weekly?: number;
  monthly?: number;
  total: number;
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  current: number;
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  lastUsedAt?: Date;
}

/**
 * Resource renewal information
 */
export interface ResourceRenewal {
  period: RenewalPeriod;
  nextRenewalAt?: Date;
}

/**
 * Resource allocation data
 */
export interface ResourceAllocation {
  id: string;
  userId: string;
  resourceType: ResourceType;
  allocated: number;
  used: number;
  remaining: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total' | 'once';
  createdAt: string;
  expiresAt?: string;
  renewsAt?: string;
  tier?: string;
  metadata?: Record<string, any>;
}

/**
 * Resource usage record
 */
export interface ResourceUsageRecord {
  id: string;
  userId: string;
  resourceType: ResourceType;
  amount: number;
  timestamp: string;
  context: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

/**
 * Resource purchase data
 */
export interface ResourcePurchase {
  id: string;
  userId: string;
  resourceType: ResourceType;
  amount: number;
  price: number;
  currency: string;
  paymentId: string;
  purchaseDate: string;
  isRecurring: boolean;
  nextRenewalDate?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
}

/**
 * Resource filter options
 */
export interface ResourceFilterOptions {
  resourceType?: ResourceType | ResourceType[];
  period?: ResourceAllocation['period'] | ResourceAllocation['period'][];
  minRemaining?: number;
  includeExpired?: boolean;
  tier?: string;
  sortBy?: 'createdAt' | 'expiresAt' | 'remaining';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Resource service interface
 */
export interface IResourceService {
  /**
   * Get resources for the current user
   */
  getResources(): Promise<Resource[]>;

  /**
   * Get a specific resource
   * @param resourceType Type of resource to retrieve
   */
  getResource(resourceType: ResourceType): Promise<Resource>;

  /**
   * Allocate resources for usage
   * @param allocation Resource allocation request
   */
  allocateResource(allocation: ResourceAllocation): Promise<boolean>;

  /**
   * Track resource usage
   * @param type Resource type
   * @param amount Amount used
   */
  trackUsage(type: ResourceType, amount: number): Promise<ResourceUsage>;

  /**
   * Check if a resource action is allowed
   * @param type Resource type
   * @param amount Amount needed
   */
  checkAllowance(type: ResourceType, amount: number): Promise<boolean>;

  /**
   * Purchase additional resources
   * @param type Resource type
   * @param amount Amount to add
   */
  purchaseResources(type: ResourceType, amount: number): Promise<Resource>;

  /**
   * Renew resources
   * @param type Resource type
   */
  renewResources(type: ResourceType): Promise<Resource>;

  /**
   * Get resource usage statistics
   * @param type Resource type
   * @param period Time period for statistics
   */
  getUsageStats(type: ResourceType, period: 'day' | 'week' | 'month'): Promise<{
    used: number;
    total: number;
    remaining: number;
    usage: Array<{
      timestamp: Date;
      amount: number;
    }>;
  }>;
}

/**
 * Resource API interface
 */
export interface IResourceAPI {
  /**
   * Get resource allocations for the current user
   */
  getResourceAllocations(filter?: ResourceFilterOptions): Promise<ResourceAllocation[]>;
  
  /**
   * Get a specific resource allocation
   */
  getResourceAllocation(resourceType: ResourceType, period?: string): Promise<ResourceAllocation>;
  
  /**
   * Check if a resource action is allowed
   */
  checkResourceAvailability(
    resourceType: ResourceType,
    amount?: number,
    targetId?: string
  ): Promise<{
    isAllowed: boolean;
    remaining: number;
    cooldownRemaining?: number;
    nextRenewal?: string;
    restrictions?: string[];
  }>;
  
  /**
   * Use a resource
   */
  useResource(
    resourceType: ResourceType,
    amount: number,
    context: string,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    remaining: number;
    usageRecord?: ResourceUsageRecord;
    error?: string;
  }>;
  
  /**
   * Get resource usage history
   */
  getResourceUsageHistory(
    resourceType: ResourceType,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
      context?: string;
      targetId?: string;
    }
  ): Promise<ResourceUsageRecord[]>;
  
  /**
   * Purchase resources
   */
  purchaseResource(
    resourceType: ResourceType,
    amount: number,
    isRecurring?: boolean,
    paymentMethodId?: string
  ): Promise<ResourcePurchase>;
  
  /**
   * Cancel a recurring resource purchase
   */
  cancelRecurringPurchase(purchaseId: string): Promise<boolean>;
  
  /**
   * Get resource purchase history
   */
  getResourcePurchases(
    resourceType?: ResourceType,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
      status?: ResourcePurchase['status'] | ResourcePurchase['status'][];
    }
  ): Promise<ResourcePurchase[]>;
  
  /**
   * Get resource limits and pricing
   */
  getResourceLimits(): Promise<Record<ResourceType, {
    baseAllocation: number;
    period: ResourceAllocation['period'];
    tierMultipliers: Record<string, number>;
    purchaseOptions: Array<{
      amount: number;
      price: number;
      currency: string;
      isPopular?: boolean;
      savePercentage?: number;
    }>;
  }>>;
} 