// User entity: profile, preferences, phase status

import { PersonalityType } from '../value-objects/PersonalityType';
import { Location } from '../value-objects/Location';
import { Age } from '../value-objects/Age';
import { Interest } from '../value-objects/Interest';
import { PhaseStatus } from '../value-objects/PhaseStatus';
import { UserId } from '../value-objects/UserId';
import { PrivacyLevel } from '../value-objects/PrivacyLevel';

export class User {
  private readonly id: UserId;
  private profile: {
    name: string;
    age: Age;
    location: Location;
    bio: string;
    interests: Interest[];
    personalityType: PersonalityType;
    photos: string[]; // URLs to photos
    privacySettings: Map<string, PrivacyLevel>;
  };
  private phaseStatus: PhaseStatus;
  private matchPreferences: {
    ageRange: { min: number; max: number };
    locationRadius: number; // in kilometers
    interests: string[];
    personalityTypes: PersonalityType[];
  };
  private verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };

  constructor(
    id: UserId,
    name: string,
    age: Age,
    location: Location,
    personalityType: PersonalityType
  ) {
    this.id = id;
    this.profile = {
      name,
      age,
      location,
      bio: '',
      interests: [],
      personalityType,
      photos: [],
      privacySettings: new Map(),
    };
    this.phaseStatus = PhaseStatus.create('phase1');
    this.matchPreferences = {
      ageRange: { min: 18, max: 99 },
      locationRadius: 50,
      interests: [],
      personalityTypes: [],
    };
    this.verificationStatus = {
      email: false,
      phone: false,
      identity: false,
    };
  }

  // Identity methods
  getId(): UserId {
    return this.id;
  }

  // Profile methods
  updateProfile(updates: Partial<typeof this.profile>): void {
    this.profile = { ...this.profile, ...updates };
  }

  getProfile(): Readonly<typeof this.profile> {
    return Object.freeze({ ...this.profile });
  }

  // Phase methods
  getCurrentPhase(): PhaseStatus {
    return this.phaseStatus;
  }

  advanceToNextPhase(): void {
    this.phaseStatus = this.phaseStatus.advance();
  }

  // Match preference methods
  updateMatchPreferences(updates: Partial<typeof this.matchPreferences>): void {
    this.matchPreferences = { ...this.matchPreferences, ...updates };
  }

  getMatchPreferences(): Readonly<typeof this.matchPreferences> {
    return Object.freeze({ ...this.matchPreferences });
  }

  // Verification methods
  verifyEmail(): void {
    this.verificationStatus.email = true;
  }

  verifyPhone(): void {
    this.verificationStatus.phone = true;
  }

  verifyIdentity(): void {
    this.verificationStatus.identity = true;
  }

  isFullyVerified(): boolean {
    return Object.values(this.verificationStatus).every(status => status);
  }

  // Privacy methods
  setPrivacyLevel(attribute: string, level: PrivacyLevel): void {
    this.profile.privacySettings.set(attribute, level);
  }

  getPrivacyLevel(attribute: string): PrivacyLevel {
    return this.profile.privacySettings.get(attribute) || PrivacyLevel.create('private');
  }

  // Validation methods
  private validateAge(): boolean {
    return this.profile.age.getValue() >= 18;
  }

  private validateProfile(): boolean {
    return (
      this.profile.name.length > 0 &&
      this.validateAge() &&
      this.profile.location.isValid() &&
      this.profile.photos.length > 0
    );
  }

  canAdvancePhase(): boolean {
    return (
      this.validateProfile() &&
      this.isFullyVerified() &&
      this.phaseStatus.canAdvance()
    );
  }
} 