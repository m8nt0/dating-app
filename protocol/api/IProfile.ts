/**
 * Profile management API interface
 */

/**
 * User profile data
 */
export interface Profile {
  id: string;
  did: string;
  username: string;
  displayName?: string;
  bio?: string;
  dateOfBirth: string;
  gender: string;
  location?: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    city?: string;
    country?: string;
    postalCode?: string;
  };
  photos: Array<{
    id: string;
    url: string;
    ipfsCid?: string;
    isVerified?: boolean;
    order?: number;
  }>;
  interests?: string[];
  preferences?: {
    genderPreference?: string[];
    ageRange?: {
      min: number;
      max: number;
    };
    distanceMax?: number;
    relationshipType?: string[];
  };
  verifications?: Array<{
    type: string;
    verified: boolean;
    verifiedAt?: string;
    provider?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  privacySettings?: {
    showOnlineStatus?: boolean;
    showLocation?: boolean;
    locationPrecision?: string;
    showLastActive?: boolean;
  };
}

/**
 * Profile update data
 */
export interface ProfileUpdate {
  displayName?: string;
  bio?: string;
  gender?: string;
  location?: Profile['location'];
  photos?: Profile['photos'];
  interests?: string[];
  preferences?: Partial<Profile['preferences']>;
  privacySettings?: Partial<Profile['privacySettings']>;
}

/**
 * Profile API interface
 */
export interface IProfileAPI {
  /**
   * Get the current user's profile
   */
  getMyProfile(): Promise<Profile>;
  
  /**
   * Get a user's profile by ID
   */
  getProfile(userId: string): Promise<Profile>;
  
  /**
   * Update the current user's profile
   */
  updateProfile(update: ProfileUpdate): Promise<Profile>;
  
  /**
   * Add a photo to the profile
   */
  addPhoto(photo: File | Blob, metadata?: { order?: number }): Promise<Profile['photos'][0]>;
  
  /**
   * Remove a photo from the profile
   */
  removePhoto(photoId: string): Promise<boolean>;
  
  /**
   * Reorder profile photos
   */
  reorderPhotos(photoIds: string[]): Promise<Profile['photos']>;
  
  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: Partial<Profile['privacySettings']>): Promise<Profile['privacySettings']>;
  
  /**
   * Get profile visibility for a specific user
   */
  getProfileVisibility(userId: string): Promise<{
    canView: boolean;
    canMessage: boolean;
    restrictions?: string[];
  }>;
  
  /**
   * Block a user
   */
  blockUser(userId: string): Promise<boolean>;
  
  /**
   * Unblock a user
   */
  unblockUser(userId: string): Promise<boolean>;
  
  /**
   * Get blocked users
   */
  getBlockedUsers(): Promise<string[]>;
  
  /**
   * Report a user
   */
  reportUser(userId: string, reason: string, details?: string): Promise<boolean>;
} 