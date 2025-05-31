// Myers-Briggs personality type

export type PersonalityDimension = {
  dimension: 'extraversion' | 'openness' | 'conscientiousness' | 'agreeableness' | 'neuroticism';
  score: number; // 0-100
};

export class PersonalityType {
  private readonly dimensions: PersonalityDimension[];
  private readonly type: string;

  private constructor(dimensions: PersonalityDimension[]) {
    this.validateDimensions(dimensions);
    this.dimensions = dimensions;
    this.type = this.calculateType();
  }

  static create(dimensions: PersonalityDimension[]): PersonalityType {
    return new PersonalityType(dimensions);
  }

  getDimensions(): readonly PersonalityDimension[] {
    return Object.freeze([...this.dimensions]);
  }

  getType(): string {
    return this.type;
  }

  getCompatibilityScore(other: PersonalityType): number {
    const otherDimensions = other.getDimensions();
    let totalDifference = 0;

    this.dimensions.forEach((dimension, index) => {
      const diff = Math.abs(dimension.score - otherDimensions[index].score);
      totalDifference += diff;
    });

    // Convert to 0-100 scale where 100 is perfect match
    return 100 - (totalDifference / (100 * this.dimensions.length));
  }

  private validateDimensions(dimensions: PersonalityDimension[]): void {
    if (dimensions.length !== 5) {
      throw new Error('Personality must have exactly 5 dimensions');
    }

    const validDimensions = [
      'extraversion',
      'openness',
      'conscientiousness',
      'agreeableness',
      'neuroticism'
    ];

    dimensions.forEach(dim => {
      if (!validDimensions.includes(dim.dimension)) {
        throw new Error(`Invalid dimension: ${dim.dimension}`);
      }
      if (dim.score < 0 || dim.score > 100) {
        throw new Error('Dimension scores must be between 0 and 100');
      }
    });
  }

  private calculateType(): string {
    // Simplified example - in reality would use more sophisticated algorithm
    const dominantTraits = this.dimensions
      .filter(dim => dim.score > 70)
      .map(dim => dim.dimension);

    if (dominantTraits.length === 0) {
      return 'Balanced';
    }

    return dominantTraits
      .map(trait => trait.charAt(0).toUpperCase() + trait.slice(1))
      .join('-');
  }

  equals(other: PersonalityType): boolean {
    if (!(other instanceof PersonalityType)) {
      return false;
    }

    return this.dimensions.every((dim, index) => 
      dim.dimension === other.dimensions[index].dimension &&
      dim.score === other.dimensions[index].score
    );
  }
} 