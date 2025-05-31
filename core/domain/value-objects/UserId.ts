// Unique user identifier with validation

import { randomUUID } from 'crypto';

export class UserId {
  private readonly value: string;
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(id: string) {
    this.validateId(id);
    this.value = id.toLowerCase();
  }

  static create(id?: string): UserId {
    return new UserId(id || randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  private validateId(id: string): void {
    if (!UserId.UUID_REGEX.test(id)) {
      throw new Error('Invalid UUID format');
    }
  }

  equals(other: UserId): boolean {
    if (!(other instanceof UserId)) {
      return false;
    }

    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static isValid(id: string): boolean {
    return UserId.UUID_REGEX.test(id);
  }
} 