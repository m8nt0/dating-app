/**
 * Resource tracking for user quotas and limits
 */

import { ResourceType } from '../../protocol/api/IResource';

/**
 * Resource allocation
 */
export interface ResourceAllocation {
  id: string;
  userId: string;
  resourceType: ResourceType;
  allocated: number;
  used: number;
  remaining: number;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
  createdAt: number;
  expiresAt?: number;
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
  timestamp: number;
  context: string;
  metadata?: Record<string, any>;
}

/**
 * Resource allocation policy
 */
export interface ResourceAllocationPolicy {
  resourceType: ResourceType;
  baseAllocation: number;
  tierMultipliers: Record<string, number>;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
  renewalEnabled: boolean;
  carryOver: boolean;
  maxCarryOver?: number;
}

/**
 * Resource tracking configuration
 */
export interface ResourceTrackingConfig {
  policies?: ResourceAllocationPolicy[];
  defaultTier?: string;
  defaultResourcePolicy?: Partial<ResourceAllocationPolicy>;
  usageWindowSizes?: Record<ResourceType, number>;
}

/**
 * Resource tracking service interface
 */
export interface IResourceTracking {
  /**
   * Initialize the resource tracking service
   */
  init(config: ResourceTrackingConfig): Promise<void>;
  
  /**
   * Get resource allocations for a user
   */
  getAllocations(userId: string): Promise<Record<ResourceType, ResourceAllocation[]>>;
  
  /**
   * Get specific resource allocation
   */
  getAllocation(userId: string, resourceType: ResourceType, period?: string): Promise<ResourceAllocation | null>;
  
  /**
   * Allocate resources to a user
   */
  allocateResources(
    userId: string,
    resourceType: ResourceType,
    amount: number,
    period?: string,
    metadata?: Record<string, any>
  ): Promise<ResourceAllocation>;
  
  /**
   * Track resource usage
   */
  trackUsage(
    userId: string,
    resourceType: ResourceType,
    amount: number,
    context: string,
    metadata?: Record<string, any>
  ): Promise<boolean>;
  
  /**
   * Check if an action is allowed
   */
  isAllowed(
    userId: string,
    resourceType: ResourceType,
    amount: number
  ): Promise<boolean>;
  
  /**
   * Get usage history
   */
  getUsageHistory(
    userId: string,
    resourceType: ResourceType,
    options?: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    }
  ): Promise<ResourceUsageRecord[]>;
  
  /**
   * Renew resource allocations
   */
  renewAllocations(userId: string, resourceType?: ResourceType): Promise<number>;
  
  /**
   * Update allocation policy
   */
  updatePolicy(policy: ResourceAllocationPolicy): Promise<void>;
  
  /**
   * Reset usage
   */
  resetUsage(userId: string, resourceType?: ResourceType): Promise<void>;
}