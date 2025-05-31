// Personal AI coach entity: insights, progress, recommendations

import { UserId } from '../value-objects/UserId';

export class AICoach {
  private readonly id: string;
  private readonly userId: UserId;
  private readonly insights: string[];
  private readonly recommendations: string[];
  private readonly progress: string[];

  constructor(id: string, userId: UserId, insights: string[], recommendations: string[], progress: string[]) {
    this.id = id;
    this.userId = userId;
    this.insights = insights;
    this.recommendations = recommendations;
    this.progress = progress;
  }
}

