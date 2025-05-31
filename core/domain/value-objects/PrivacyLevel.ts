// Data sharing and visibility controls

export type PrivacyLevelType = 'public' | 'matches' | 'phase2' | 'phase3' | 'private';

export class PrivacyLevel {
  private readonly level: PrivacyLevelType;
  private static readonly LEVEL_HIERARCHY: PrivacyLevelType[] = [
    'public',
    'matches',
    'phase2',
    'phase3',
    'private'
  ];

  private constructor(level: PrivacyLevelType) {
    this.validateLevel(level);
    this.level = level;
  }

  static create(level: PrivacyLevelType): PrivacyLevel {
    return new PrivacyLevel(level);
  }

  getLevel(): PrivacyLevelType {
    return this.level;
  }

  isMoreRestrictiveThan(other: PrivacyLevel): boolean {
    const thisIndex = PrivacyLevel.LEVEL_HIERARCHY.indexOf(this.level);
    const otherIndex = PrivacyLevel.LEVEL_HIERARCHY.indexOf(other.level);
    return thisIndex > otherIndex;
  }

  isLessRestrictiveThan(other: PrivacyLevel): boolean {
    const thisIndex = PrivacyLevel.LEVEL_HIERARCHY.indexOf(this.level);
    const otherIndex = PrivacyLevel.LEVEL_HIERARCHY.indexOf(other.level);
    return thisIndex < otherIndex;
  }

  canAccessFrom(userPhase: 'phase1' | 'phase2' | 'phase3'): boolean {
    switch (this.level) {
      case 'public':
        return true;
      case 'matches':
        return true; // Assuming matched users can always see matched content
      case 'phase2':
        return userPhase === 'phase2' || userPhase === 'phase3';
      case 'phase3':
        return userPhase === 'phase3';
      case 'private':
        return false;
      default:
        return false;
    }
  }

  private validateLevel(level: PrivacyLevelType): void {
    if (!PrivacyLevel.LEVEL_HIERARCHY.includes(level)) {
      throw new Error(`Invalid privacy level: ${level}`);
    }
  }

  equals(other: PrivacyLevel): boolean {
    if (!(other instanceof PrivacyLevel)) {
      return false;
    }

    return this.level === other.level;
  }

  toString(): string {
    return this.level;
  }

  static getLevels(): PrivacyLevelType[] {
    return [...PrivacyLevel.LEVEL_HIERARCHY];
  }

  static getDefaultLevel(): PrivacyLevel {
    return PrivacyLevel.create('private');
  }
} 