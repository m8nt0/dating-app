// Age with validation and privacy

export class Age {
  private readonly value: number;
  private static readonly MIN_AGE = 18;
  private static readonly MAX_AGE = 120;

  private constructor(age: number) {
    this.validateAge(age);
    this.value = age;
  }

  static create(age: number): Age {
    return new Age(age);
  }

  getValue(): number {
    return this.value;
  }

  isWithinRange(minAge: number, maxAge: number): boolean {
    return this.value >= minAge && this.value <= maxAge;
  }

  private validateAge(age: number): void {
    if (!Number.isInteger(age)) {
      throw new Error('Age must be an integer');
    }

    if (age < Age.MIN_AGE) {
      throw new Error(`Age must be at least ${Age.MIN_AGE} years`);
    }

    if (age > Age.MAX_AGE) {
      throw new Error(`Age cannot exceed ${Age.MAX_AGE} years`);
    }
  }

  equals(other: Age): boolean {
    if (!(other instanceof Age)) {
      return false;
    }

    return this.value === other.value;
  }

  toString(): string {
    return `${this.value} years`;
  }

  static getMinAge(): number {
    return Age.MIN_AGE;
  }

  static getMaxAge(): number {
    return Age.MAX_AGE;
  }
} 