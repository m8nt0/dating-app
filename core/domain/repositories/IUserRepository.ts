// User CRUD and query operations

import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Location } from '../value-objects/Location';
import { PersonalityType } from '../value-objects/PersonalityType';
import { Interest } from '../value-objects/Interest';
import { Phase } from '../value-objects/PhaseStatus';

export interface UserFilter {
  ageRange?: { min: number; max: number };
  location?: { center: Location; radiusKm: number };
  interests?: Interest[];
  personalityTypes?: PersonalityType[];
  phase?: Phase;
  verificationStatus?: {
    email?: boolean;
    phone?: boolean;
    identity?: boolean;
  };
}

export interface UserSearchCriteria {
  ageRange?: { min: number; max: number };
  location?: {
    center: Location;
    radiusKm: number;
  };
  interests?: Interest[];
  personalityTypes?: PersonalityType[];
  verificationStatus?: {
    email?: boolean;
    phone?: boolean;
    identity?: boolean;
  };
  phase?: string;
}

export interface IUserRepository {
  // Basic CRUD operations
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  delete(id: UserId): Promise<void>;
  update(user: User): Promise<void>;

  // Query operations
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByPhase(phase: Phase): Promise<User[]>;
  
  // Advanced search operations
  findPotentialMatches(
    userId: UserId,
    filter: UserFilter,
    limit?: number,
    offset?: number
  ): Promise<User[]>;
  
  findByLocation(
    location: Location,
    radiusKm: number,
    limit?: number,
    offset?: number
  ): Promise<User[]>;
  
  findByInterests(
    interests: Interest[],
    minMatchCount: number,
    limit?: number,
    offset?: number
  ): Promise<User[]>;
  
  findByPersonalityCompatibility(
    personalityType: PersonalityType,
    minScore: number,
    limit?: number,
    offset?: number
  ): Promise<User[]>;

  // Verification operations
  markEmailVerified(id: UserId): Promise<void>;
  markPhoneVerified(id: UserId): Promise<void>;
  markIdentityVerified(id: UserId): Promise<void>;

  // Phase management
  updatePhase(id: UserId, phase: Phase): Promise<void>;
  findUsersEligibleForPhaseAdvancement(phase: Phase): Promise<User[]>;

  // Analytics operations
  countByPhase(phase: Phase): Promise<number>;
  countByVerificationStatus(status: { [key: string]: boolean }): Promise<number>;
  getAgeDistribution(): Promise<{ [age: number]: number }>;
  getLocationDistribution(): Promise<{ [location: string]: number }>;

  // Batch operations
  saveMany(users: User[]): Promise<void>;
  findByIds(ids: UserId[]): Promise<User[]>;
  deleteMany(ids: UserId[]): Promise<void>;

  // Export operations
  exportUserData(id: UserId): Promise<any>; // Returns user data in GDPR-compliant format

  // Search and filtering
  search(criteria: UserSearchCriteria): Promise<User[]>;
  findPotentialMatches(userId: UserId, limit?: number): Promise<User[]>;
  findByPhase(phase: string): Promise<User[]>;
  
  // Analytics and reporting
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getUsersByVerificationStatus(): Promise<{
    email: number;
    phone: number;
    identity: number;
    fully: number;
  }>;
  getUsersByPhase(): Promise<Record<string, number>>;
  
  // Advanced queries
  findNearbyUsers(
    location: Location,
    radiusKm: number,
    limit?: number
  ): Promise<User[]>;
  
  findByInterests(
    interests: Interest[],
    matchThreshold?: number
  ): Promise<User[]>;
  
  findByPersonalityCompatibility(
    personalityType: PersonalityType,
    compatibilityThreshold?: number
  ): Promise<User[]>;
} 