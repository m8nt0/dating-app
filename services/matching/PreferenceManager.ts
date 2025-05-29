/**
 * Preference Manager
 * 
 * Manages user preferences for matching, including criteria like age range,
 * location radius, interests, and blocked users.
 */

import { MatchingPreferences } from '../../protocol/api/IMatchmaking';
import { StorageManager } from '../../core/storage/indexeddb';

export class PreferenceManager {
  private userId: string;
  private storage: StorageManager;
  private preferences: MatchingPreferences | null = null;
  private blockedUsers: Set<string> = new Set();
  private readonly PREFERENCES_KEY = 'matching_preferences';
  private readonly BLOCKED_USERS_KEY = 'blocked_users';
  
  constructor(userId: string) {
    this.userId = userId;
    this.storage = new StorageManager('preferences');
  }
  
  /**
   * Initialize the preference manager
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.loadPreferences();
    await this.loadBlockedUsers();
  }
  
  /**
   * Get the current user's matching preferences
   */
  async getPreferences(): Promise<MatchingPreferences> {
    if (!this.preferences) {
      await this.loadPreferences();
    }
    
    return this.preferences!;
  }
  
  /**
   * Update the user's matching preferences
   */
  async updatePreferences(updates: Partial<MatchingPreferences>): Promise<MatchingPreferences> {
    if (!this.preferences) {
      await this.loadPreferences();
    }
    
    this.preferences = {
      ...this.preferences!,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.savePreferences();
    return this.preferences;
  }
  
  /**
   * Add a user to the blocked list
   */
  async addBlockedUser(userId: string): Promise<void> {
    this.blockedUsers.add(userId);
    await this.saveBlockedUsers();
  }
  
  /**
   * Remove a user from the blocked list
   */
  async removeBlockedUser(userId: string): Promise<void> {
    this.blockedUsers.delete(userId);
    await this.saveBlockedUsers();
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
  async getBlockedUsers(): Promise<string[]> {
    return Array.from(this.blockedUsers);
  }
  
  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    const key = `${this.PREFERENCES_KEY}:${this.userId}`;
    const storedPreferences = await this.storage.get(key);
    
    if (storedPreferences) {
      this.preferences = storedPreferences as MatchingPreferences;
    } else {
      // Set default preferences
      this.preferences = {
        ageRange: { min: 18, max: 50 },
        locationRadius: 50,
        interests: [],
        genderPreference: 'all',
        relationshipType: ['dating', 'friendship'],
        dealBreakers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.savePreferences();
    }
  }
  
  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    const key = `${this.PREFERENCES_KEY}:${this.userId}`;
    await this.storage.set(key, this.preferences);
  }
  
  /**
   * Load blocked users from storage
   */
  private async loadBlockedUsers(): Promise<void> {
    const key = `${this.BLOCKED_USERS_KEY}:${this.userId}`;
    const blockedUsersList = await this.storage.get(key) as string[] || [];
    this.blockedUsers = new Set(blockedUsersList);
  }
  
  /**
   * Save blocked users to storage
   */
  private async saveBlockedUsers(): Promise<void> {
    const key = `${this.BLOCKED_USERS_KEY}:${this.userId}`;
    const blockedUsersList = Array.from(this.blockedUsers);
    await this.storage.set(key, blockedUsersList);
  }
}
