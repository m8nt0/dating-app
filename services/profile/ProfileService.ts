/**
 * Profile Service
 * 
 * Manages user profiles, including creation, updating, and retrieval.
 * Handles profile data synchronization and privacy settings.
 */

import { EventEmitter } from 'events';
import { Profile, ProfilePhoto, ProfileVisibility, ProfileFilterOptions } from '../../protocol/api/IProfile';
import { StorageManager } from '../../core/storage/indexeddb';
import { VerificationService } from './VerificationService';
import { PrivacyManager } from './PrivacyManager';

export interface ProfileServiceOptions {
  /**
   * Enable profile verification
   */
  enableVerification?: boolean;
  
  /**
   * Enable profile privacy controls
   */
  enablePrivacyControls?: boolean;
  
  /**
   * Maximum number of photos allowed
   */
  maxPhotos?: number;
  
  /**
   * Maximum bio length
   */
  maxBioLength?: number;
}

export class ProfileService extends EventEmitter {
  private userId: string;
  private storage: StorageManager;
  private verificationService: VerificationService | null = null;
  private privacyManager: PrivacyManager | null = null;
  private options: Required<ProfileServiceOptions>;
  private profile: Profile | null = null;
  
  constructor(userId: string, options: ProfileServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      enableVerification: true,
      enablePrivacyControls: true,
      maxPhotos: 9,
      maxBioLength: 500,
      ...options
    };
    
    this.storage = new StorageManager('profiles');
    
    if (this.options.enableVerification) {
      this.verificationService = new VerificationService(userId);
    }
    
    if (this.options.enablePrivacyControls) {
      this.privacyManager = new PrivacyManager(userId);
    }
  }
  
  /**
   * Initialize the profile service
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    
    if (this.verificationService) {
      await this.verificationService.initialize();
    }
    
    if (this.privacyManager) {
      await this.privacyManager.initialize();
    }
    
    // Load the user's profile
    await this.loadProfile();
  }
  
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<Profile> {
    if (!this.profile) {
      await this.loadProfile();
    }
    
    return this.profile!;
  }
  
  /**
   * Get a profile by user ID
   */
  async getProfileById(userId: string): Promise<Profile | null> {
    // If it's the current user, return their profile
    if (userId === this.userId && this.profile) {
      return this.profile;
    }
    
    // Otherwise, fetch from storage or network
    try {
      const profile = await this.storage.get(`profile:${userId}`);
      
      // Apply privacy filters if enabled
      if (this.privacyManager && profile) {
        return this.privacyManager.applyPrivacyFilters(profile as Profile, this.userId);
      }
      
      return profile as Profile;
    } catch (error) {
      console.error(`Failed to get profile for user ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new profile
   */
  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    if (this.profile) {
      throw new Error('Profile already exists');
    }
    
    // Validate profile data
    this.validateProfileData(profileData);
    
    // Create the profile
    const now = new Date().toISOString();
    this.profile = {
      id: this.userId,
      username: profileData.username || `user_${this.userId}`,
      displayName: profileData.displayName || profileData.username || `User ${this.userId}`,
      bio: profileData.bio || '',
      photos: profileData.photos || [],
      interests: profileData.interests || [],
      location: profileData.location,
      dateOfBirth: profileData.dateOfBirth,
      gender: profileData.gender || 'other',
      lookingFor: profileData.lookingFor || ['friendship', 'dating'],
      education: profileData.education,
      occupation: profileData.occupation,
      relationshipStatus: profileData.relationshipStatus,
      height: profileData.height,
      languages: profileData.languages || [],
      createdAt: now,
      updatedAt: now,
      visibility: profileData.visibility || {
        profile: 'public',
        photos: 'public',
        location: 'approximate',
        lastActive: 'public',
        interests: 'public'
      },
      verificationStatus: 'unverified'
    };
    
    // Save the profile
    await this.saveProfile();
    
    // Emit event
    this.emit('profile-created', this.profile);
    
    return this.profile;
  }
  
  /**
   * Update the current user's profile
   */
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    if (!this.profile) {
      throw new Error('Profile does not exist');
    }
    
    // Validate updates
    this.validateProfileData(updates);
    
    // Apply updates
    this.profile = {
      ...this.profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save the profile
    await this.saveProfile();
    
    // Emit event
    this.emit('profile-updated', this.profile);
    
    return this.profile;
  }
  
  /**
   * Add a photo to the profile
   */
  async addPhoto(photo: ProfilePhoto): Promise<Profile> {
    if (!this.profile) {
      throw new Error('Profile does not exist');
    }
    
    // Check if maximum number of photos is reached
    if (this.profile.photos && this.profile.photos.length >= this.options.maxPhotos) {
      throw new Error(`Maximum number of photos (${this.options.maxPhotos}) reached`);
    }
    
    // Add the photo
    const photos = this.profile.photos || [];
    
    // If this is the first photo, make it primary
    if (photos.length === 0) {
      photo.isPrimary = true;
    }
    
    // Add a unique ID if not provided
    if (!photo.id) {
      photo.id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    photos.push(photo);
    
    // Update the profile
    return this.updateProfile({ photos });
  }
  
  /**
   * Remove a photo from the profile
   */
  async removePhoto(photoId: string): Promise<Profile> {
    if (!this.profile || !this.profile.photos) {
      throw new Error('Profile or photos do not exist');
    }
    
    // Find the photo
    const photoIndex = this.profile.photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      throw new Error(`Photo with ID ${photoId} not found`);
    }
    
    // Check if it's the primary photo
    const isPrimary = this.profile.photos[photoIndex].isPrimary;
    
    // Remove the photo
    const photos = [...this.profile.photos];
    photos.splice(photoIndex, 1);
    
    // If it was the primary photo, set a new primary photo
    if (isPrimary && photos.length > 0) {
      photos[0].isPrimary = true;
    }
    
    // Update the profile
    return this.updateProfile({ photos });
  }
  
  /**
   * Set a photo as primary
   */
  async setPrimaryPhoto(photoId: string): Promise<Profile> {
    if (!this.profile || !this.profile.photos) {
      throw new Error('Profile or photos do not exist');
    }
    
    // Find the photo
    const photoIndex = this.profile.photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      throw new Error(`Photo with ID ${photoId} not found`);
    }
    
    // Update primary status
    const photos = this.profile.photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    
    // Update the profile
    return this.updateProfile({ photos });
  }
  
  /**
   * Update profile visibility settings
   */
  async updateVisibility(visibility: Partial<ProfileVisibility>): Promise<Profile> {
    if (!this.profile) {
      throw new Error('Profile does not exist');
    }
    
    // Update visibility settings
    const updatedVisibility = {
      ...this.profile.visibility,
      ...visibility
    };
    
    // Update the profile
    return this.updateProfile({ visibility: updatedVisibility });
  }
  
  /**
   * Start the verification process
   */
  async startVerification(): Promise<void> {
    if (!this.verificationService) {
      throw new Error('Verification service is not enabled');
    }
    
    if (!this.profile) {
      throw new Error('Profile does not exist');
    }
    
    // Start the verification process
    await this.verificationService.startVerification();
    
    // Update the profile's verification status
    await this.updateProfile({ verificationStatus: 'pending' });
  }
  
  /**
   * Search for profiles
   */
  async searchProfiles(filters: ProfileFilterOptions): Promise<Profile[]> {
    // In a real implementation, this would query a database or network
    // For now, we'll just return a mock result
    
    // Get all profiles from storage
    const allProfiles = await this.storage.getAll('profile:');
    
    // Apply filters
    let filteredProfiles = allProfiles as Profile[];
    
    if (filters.username) {
      const usernameRegex = new RegExp(filters.username, 'i');
      filteredProfiles = filteredProfiles.filter(p => 
        p.username.match(usernameRegex) || 
        (p.displayName && p.displayName.match(usernameRegex))
      );
    }
    
    if (filters.interests && filters.interests.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.interests && filters.interests!.some(interest => p.interests!.includes(interest))
      );
    }
    
    if (filters.gender) {
      filteredProfiles = filteredProfiles.filter(p => p.gender === filters.gender);
    }
    
    if (filters.ageRange) {
      filteredProfiles = filteredProfiles.filter(p => {
        if (!p.dateOfBirth) return false;
        const age = this.calculateAge(new Date(p.dateOfBirth));
        return age >= filters.ageRange!.min && age <= filters.ageRange!.max;
      });
    }
    
    if (filters.location && filters.locationRadius) {
      filteredProfiles = filteredProfiles.filter(p => {
        if (!p.location || !p.location.latitude || !p.location.longitude) return false;
        
        const distance = this.calculateDistance(
          filters.location!.latitude,
          filters.location!.longitude,
          p.location.latitude,
          p.location.longitude
        );
        
        return distance <= filters.locationRadius!;
      });
    }
    
    // Apply privacy filters
    if (this.privacyManager) {
      filteredProfiles = filteredProfiles.map(profile => 
        this.privacyManager!.applyPrivacyFilters(profile, this.userId)
      ).filter(Boolean) as Profile[];
    }
    
    // Apply limit and sort
    const limit = filters.limit || 50;
    
    return filteredProfiles.slice(0, limit);
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
    
    if (this.verificationService) {
      await this.verificationService.dispose();
    }
    
    if (this.privacyManager) {
      await this.privacyManager.dispose();
    }
  }
  
  // Private helper methods
  
  /**
   * Load the user's profile from storage
   */
  private async loadProfile(): Promise<void> {
    try {
      const profile = await this.storage.get(`profile:${this.userId}`);
      this.profile = profile as Profile;
    } catch (error) {
      // Profile doesn't exist yet
      this.profile = null;
    }
  }
  
  /**
   * Save the user's profile to storage
   */
  private async saveProfile(): Promise<void> {
    if (!this.profile) {
      return;
    }
    
    await this.storage.set(`profile:${this.userId}`, this.profile);
  }
  
  /**
   * Validate profile data
   */
  private validateProfileData(data: Partial<Profile>): void {
    // Check bio length
    if (data.bio && data.bio.length > this.options.maxBioLength) {
      throw new Error(`Bio exceeds maximum length of ${this.options.maxBioLength} characters`);
    }
    
    // Check number of photos
    if (data.photos && data.photos.length > this.options.maxPhotos) {
      throw new Error(`Maximum number of photos (${this.options.maxPhotos}) exceeded`);
    }
    
    // Validate date of birth (must be at least 18 years old)
    if (data.dateOfBirth) {
      const age = this.calculateAge(new Date(data.dateOfBirth));
      if (age < 18) {
        throw new Error('User must be at least 18 years old');
      }
    }
  }
  
  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
