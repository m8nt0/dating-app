// Compatibility entity: scores, factors, and metrics

import { UserId } from "../value-objects/UserId";

export class Compatibility {    
  private readonly id: string;
  private readonly userId: UserId;
  private readonly compatibilityScore: number;
  private readonly compatibilityFactors: string[];
  private readonly compatibilityMetrics: string[];

  constructor(id: string, userId: UserId, compatibilityScore: number, compatibilityFactors: string[], compatibilityMetrics: string[]) {
    this.id = id;
    this.userId = userId;
    this.compatibilityScore = compatibilityScore;
    this.compatibilityFactors = compatibilityFactors;
    this.compatibilityMetrics = compatibilityMetrics;
  }
}
