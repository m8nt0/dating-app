// Match entity: compatibility, status, interactions

import { UserId } from '../value-objects/UserId';
import { Phase } from '../value-objects/PhaseStatus';

export type MatchStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'mutual'
  | 'completed';

export type CompatibilityScore = {
  overall: number;
  personality: number;
  interests: number;
  values: number;
  communication: number;
};

export class Match {
  private readonly id: string;
  private readonly user1Id: UserId;
  private readonly user2Id: UserId;
  private status: MatchStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly phase: Phase;
  private readonly compatibilityScore: CompatibilityScore;
  private readonly interactionHistory: {
    timestamp: Date;
    type: string;
    initiator: UserId;
    details: any;
  }[];

  constructor(
    id: string,
    user1Id: UserId,
    user2Id: UserId,
    phase: Phase,
    compatibilityScore: CompatibilityScore
  ) {
    this.validateUsers(user1Id, user2Id);
    this.id = id;
    this.user1Id = user1Id;
    this.user2Id = user2Id;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.phase = phase;
    this.compatibilityScore = compatibilityScore;
    this.interactionHistory = [];
  }

  // Identity methods
  getId(): string {
    return this.id;
  }

  getUsers(): [UserId, UserId] {
    return [this.user1Id, this.user2Id];
  }

  // Status methods
  getStatus(): MatchStatus {
    return this.status;
  }

  accept(userId: UserId): void {
    this.validateUserInMatch(userId);
    
    if (this.status !== 'pending') {
      throw new Error('Match can only be accepted when pending');
    }

    this.status = 'accepted';
    this.updatedAt = new Date();
    this.addInteraction(userId, 'accept');
  }

  reject(userId: UserId): void {
    this.validateUserInMatch(userId);
    
    if (this.status !== 'pending' && this.status !== 'accepted') {
      throw new Error('Match can only be rejected when pending or accepted');
    }

    this.status = 'rejected';
    this.updatedAt = new Date();
    this.addInteraction(userId, 'reject');
  }

  complete(): void {
    if (this.status !== 'mutual') {
      throw new Error('Match can only be completed when mutual');
    }

    this.status = 'completed';
    this.updatedAt = new Date();
  }

  // Phase and compatibility methods
  getPhase(): Phase {
    return this.phase;
  }

  getCompatibilityScore(): Readonly<CompatibilityScore> {
    return Object.freeze({ ...this.compatibilityScore });
  }

  // Interaction methods
  addInteraction(userId: UserId, type: string, details: any = {}): void {
    this.validateUserInMatch(userId);
    
    this.interactionHistory.push({
      timestamp: new Date(),
      type,
      initiator: userId,
      details
    });
    
    this.updatedAt = new Date();
  }

  getInteractionHistory(): readonly any[] {
    return Object.freeze([...this.interactionHistory]);
  }

  // Validation methods
  private validateUsers(user1Id: UserId, user2Id: UserId): void {
    if (user1Id.equals(user2Id)) {
      throw new Error('Users in a match must be different');
    }
  }

  private validateUserInMatch(userId: UserId): void {
    if (!this.user1Id.equals(userId) && !this.user2Id.equals(userId)) {
      throw new Error('User is not part of this match');
    }
  }

  // Utility methods
  isExpired(): boolean {
    const expirationHours = this.phase === 'phase2' ? 48 : 24;
    const expirationTime = new Date(this.createdAt);
    expirationTime.setHours(expirationTime.getHours() + expirationHours);
    
    return new Date() > expirationTime;
  }

  getMatchAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  equals(other: Match): boolean {
    if (!(other instanceof Match)) {
      return false;
    }

    return this.id === other.id;
  }

  toString(): string {
    return `Match ${this.id} (${this.status})`;
  }
} 