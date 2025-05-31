// Phase 2 group entity: members, duration, and rules

import { UserId } from '../value-objects/UserId';

export class Group {
  private readonly id: string;
  private readonly members: UserId[];
  private readonly duration: number;
  private readonly rules: string[];
}