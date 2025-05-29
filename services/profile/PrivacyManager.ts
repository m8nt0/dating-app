/**
 * Privacy Manager
 * 
 * Manages user privacy settings and applies privacy filters to profiles
 * based on relationship and visibility settings.
 */

import { StorageManager } from '../../core/storage/indexeddb';
import { Profile } from '../../protocol/api/IProfile';

export type VisibilityLevel = 'public' | 'matches' | 'private' | 'approximate';

export interface PrivacySettings {
  /**
   * Profile visibility
   */
  profile: VisibilityLevel;
  
  /**
   * Photos visibility
   */
  photos: VisibilityLevel;
  
  /**
   * Location visibility
   */
  location: VisibilityLevel;
  
  /**
   * Last active visibility
   */
  lastActive: VisibilityLevel;
  
  /**
   * Interests visibility
   */
  interests: VisibilityLevel;
  
  /**
   * Additional custom privacy settings
   */
  [key: string]: VisibilityLevel;
}

export interface BlockedUser {
  userId: string;
  blockedAt: string;
  reason?: string;
}

export interface PrivacyManagerOptions {
  /**
   * Default privacy settings
   */
  defaultSettings?: Partial<PrivacySettings>;
}

export class PrivacyManager {
  private userId: string;
  private storage: StorageManager;
  private settings: PrivacySettings;
  private blockedUsers: Map<string, BlockedUser> = new Map();
  private matchedUsers: Set<string> = new Set();
  
  constructor(userId: string, options: PrivacyManagerOptions = {}) {
    this.userId = userId;
    this.storage = new StorageManager('privacy');
    
    // Set default privacy settings
    this.settings = {
      profile: 'public',
      photos: 'public',
      location: 'approximate',
      lastActive: 'public',
      interests: 'public',
      ...options.defaultSettings
    };
  }
  
  /**
   * Initialize the privacy manager
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.loadPrivacySettings();
    await this.loadBlockedUsers();
    await this.loadMatchedUsers();
  }
  
  /**
   * Get current privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    return { ...this.settings };
  }
  
  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    this.settings = {
      ...this.settings,
      ...settings
    };
    
    await this.savePrivacySettings();
    return { ...this.settings };
  }
  
  /**
   * Block a user
   */
  async blockUser(userId: string, reason?: string): Promise<void> {
    if (userId === this.userId) {
      throw new Error('Cannot block yourself');
    }
    
    const blockedUser: BlockedUser = {
      userId,
      blockedAt: new Date().toISOString(),
      reason
    };
    
    this.blockedUsers.set(userId, blockedUser);
    await this.saveBlockedUsers();
  }
  
  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<boolean> {
    const wasBlocked = this.blockedUsers.delete(userId);
    if (wasBlocked) {
      await this.saveBlockedUsers();
    }
    return wasBlocked;
  }
  
  /**
   * Check if a user is blocked
   */
  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId);
  }
  
  /**
   * Get all blocked users
   */
  getBlockedUsers(): BlockedUser[] {
    return Array.from(this.blockedUsers.values());
  }
  
  /**
   * Add a matched user
   */
  async addMatchedUser(userId: string): Promise<void> {
    this.matchedUsers.add(userId);
    await this.saveMatchedUsers();
  }
  
  /**
   * Remove a matched user
   */
  async removeMatchedUser(userId: string): Promise<void> {
    this.matchedUsers.delete(userId);
    await this.saveMatchedUsers();
  }
  
  /**
   * Check if a user is matched
   */
  isUserMatched(userId: string): boolean {
    return this.matchedUsers.has(userId);
  }
  
  /**
   * Apply privacy filters to a profile based on the relationship with the viewer
   */
  applyPrivacyFilters(profile: Profile, viewerId: string): Profile | null {
    // If the viewer is the profile owner, return the full profile
    if (viewerId === profile.id) {
      return profile;
    }
    
    // If the viewer is blocked, return null
    if (this.isUserBlocked(viewerId)) {
      return null;
    }
    
    // Create a filtered copy of the profile
    const filteredProfile: Profile = { ...profile };
    
    // Apply filters based on relationship and privacy settings
    const isMatched = this.isUserMatched(viewerId);
    
    // Filter profile fields based on visibility settings
    this.applyVisibilityFilter(filteredProfile, 'photos', isMatched);
    this.applyVisibilityFilter(filteredProfile, 'location', isMatched);
    this.applyVisibilityFilter(filteredProfile, 'interests', isMatched);
    this.applyVisibilityFilter(filteredProfile, 'lastActive', isMatched);
    
    // If profile visibility is private and not matched, return minimal info
    if (this.settings.profile === 'private' && !isMatched) {
      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        photos: filteredProfile.photos,
        verificationStatus: profile.verificationStatus
      };
    }
    
    return filteredProfile;
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // Nothing to clean up
  }
  
  // Private helper methods
  
  /**
   * Load privacy settings from storage
   */
  private async loadPrivacySettings(): Promise<void> {
    try {
      const settings = await this.storage.get(`privacy:${this.userId}:settings`);
      if (settings) {
        this.settings = settings as PrivacySettings;
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  }
  
  /**
   * Save privacy settings to storage
   */
  private async savePrivacySettings(): Promise<void> {
    await this.storage.set(`privacy:${this.userId}:settings`, this.settings);
  }
  
  /**
   * Load blocked users from storage
   */
  private async loadBlockedUsers(): Promise<void> {
    try {
      const blockedUsersList = await this.storage.get(`privacy:${this.userId}:blocked`) as BlockedUser[] || [];
      this.blockedUsers = new Map(blockedUsersList.map(user => [user.userId, user]));
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    }
  }
  
  /**
   * Save blocked users to storage
   */
  private async saveBlockedUsers(): Promise<void> {
    const blockedUsersList = Array.from(this.blockedUsers.values());
    await this.storage.set(`privacy:${this.userId}:blocked`, blockedUsersList);
  }
  
  /**
   * Load matched users from storage
   */
  private async loadMatchedUsers(): Promise<void> {
    try {
      const matchedUsersList = await this.storage.get(`privacy:${this.userId}:matched`) as string[] || [];
      this.matchedUsers = new Set(matchedUsersList);
    } catch (error) {
      console.error('Failed to load matched users:', error);
    }
  }
  
  /**
   * Save matched users to storage
   */
  private async saveMatchedUsers(): Promise<void> {
    const matchedUsersList = Array.from(this.matchedUsers);
    await this.storage.set(`privacy:${this.userId}:matched`, matchedUsersList);
  }
  
  /**
   * Apply visibility filter to a specific profile field
   */
  private applyVisibilityFilter(profile: any, field: keyof PrivacySettings, isMatched: boolean): void {
    const visibility = this.settings[field];
    
    switch (visibility) {
      case 'private':
        // Remove the field completely
        delete profile[field];
        break;
        
      case 'matches':
        // Only show to matches
        if (!isMatched) {
          delete profile[field];
        }
        break;
        
      case 'approximate':
        // Show approximate information
        if (field === 'location' && profile.location) {
          // Round coordinates to lower precision for approximate location
          if (profile.location.latitude) {
            profile.location.latitude = Math.round(profile.location.latitude * 10) / 10;
          }
          if (profile.location.longitude) {
            profile.location.longitude = Math.round(profile.location.longitude * 10) / 10;
          }
          // Remove specific address information
          delete profile.location.address;
          delete profile.location.postalCode;
        } else if (field === 'lastActive' && profile.lastActive) {
          // Show approximate last active time (e.g., "within 24 hours")
          const lastActive = new Date(profile.lastActive);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 1) {
            profile.lastActiveApproximate = 'Just now';
          } else if (hoursDiff < 24) {
            profile.lastActiveApproximate = 'Today';
          } else if (hoursDiff < 48) {
            profile.lastActiveApproximate = 'Yesterday';
          } else if (hoursDiff < 168) { // 7 days
            profile.lastActiveApproximate = 'This week';
          } else {
            profile.lastActiveApproximate = 'More than a week ago';
          }
          
          delete profile.lastActive;
        }
        break;
        
      case 'public':
      default:
        // No filtering needed
        break;
    }
  }
}
