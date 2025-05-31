// User intereset with categories and weights

export type InterestCategory =
  | 'sports'
  | 'arts'
  | 'music'
  | 'food'
  | 'travel'
  | 'technology'
  | 'science'
  | 'literature'
  | 'movies'
  | 'gaming'
  | 'fitness'
  | 'nature'
  | 'politics'
  | 'spirituality'
  | 'education';

export class Interest {
  private readonly name: string;
  private readonly category: InterestCategory;
  private readonly intensity: number; // 1-10 scale
  private readonly tags: string[];

  private constructor(
    name: string,
    category: InterestCategory,
    intensity: number,
    tags: string[] = []
  ) {
    this.validateInterest(name, intensity);
    this.name = name.toLowerCase();
    this.category = category;
    this.intensity = intensity;
    this.tags = tags.map(tag => tag.toLowerCase());
  }

  static create(
    name: string,
    category: InterestCategory,
    intensity: number,
    tags: string[] = []
  ): Interest {
    return new Interest(name, category, intensity, tags);
  }

  getName(): string {
    return this.name;
  }

  getCategory(): InterestCategory {
    return this.category;
  }

  getIntensity(): number {
    return this.intensity;
  }

  getTags(): readonly string[] {
    return Object.freeze([...this.tags]);
  }

  private validateInterest(name: string, intensity: number): void {
    if (name.trim().length === 0) {
      throw new Error('Interest name cannot be empty');
    }

    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 10) {
      throw new Error('Intensity must be an integer between 1 and 10');
    }
  }

  // But what if the user wants a person with different interests, traits, etc?
  // So the user says whats their interests, and what their potential matches should have.
  matchScore(other: Interest): number {
    let score = 0;

    // Category match
    if (this.category === other.category) {
      score += 40;
    }

    // Intensity similarity (0-20 points)
    const intensityDiff = Math.abs(this.intensity - other.intensity);
    score += 20 - (intensityDiff * 2);

    // Tag matches (up to 40 points)
    const commonTags = this.tags.filter(tag => other.tags.includes(tag));
    score += (commonTags.length / Math.max(this.tags.length, other.tags.length)) * 40;

    return score;
  }

  equals(other: Interest): boolean {
    if (!(other instanceof Interest)) {
      return false;
    }

    return (
      this.name === other.name &&
      this.category === other.category &&
      this.intensity === other.intensity &&
      this.tags.length === other.tags.length &&
      this.tags.every(tag => other.tags.includes(tag))
    );
  }

  toString(): string {
    return `${this.name} (${this.category}, ${this.intensity}/10)`;
  }

  static getCategories(): InterestCategory[] {
    return [
      'sports',
      'arts',
      'music',
      'food',
      'travel',
      'technology',
      'science',
      'literature',
      'movies',
      'gaming',
      'fitness',
      'nature',
      'politics',
      'spirituality',
      'education'
    ];
  }
} 