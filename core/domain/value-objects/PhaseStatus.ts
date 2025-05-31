// Phase progression status with validation rules

// User's current phase state
// enum PhaseStatus {
//   PHASE_1_EXPLORING = "phase1_exploring",
//   PHASE_2_READY = "phase2_ready", 
//   PHASE_2_IN_CYCLE = "phase2_in_cycle",
//   PHASE_2_WAITING = "phase2_waiting",
//   PHASE_3_MATCHED = "phase3_matched",
//   PHASE_3_RELATIONSHIP = "phase3_relationship",
//   COOLDOWN_PERIOD = "cooldown_period"
// }

// // Phase transition logic
// class PhaseTransition {
//   canEnterPhase2(): boolean
//   canEnterPhase3(): boolean  
//   handlePhase2Success(): void // → Phase 3
//   handlePhase2Failure(): void // → Phase 1 or new cycle
//   handlePhase3Breakup(): void // → 6-month cooldown
// }

export type Phase = 'phase1' | 'phase2' | 'phase3';

export class PhaseStatus {
  private readonly currentPhase: Phase;
  private readonly startedAt: Date;
  private readonly completedSteps: Set<string>;
  private static readonly PHASE_ORDER: Phase[] = ['phase1', 'phase2', 'phase3'];
  private static readonly REQUIRED_STEPS: Record<Phase, string[]> = {
    phase1: [
      'profile_completed',
      'personality_test_completed',
      'verification_completed',
      'initial_matches_reviewed'
    ],
    phase2: [
      'group_assigned',
      'deep_interactions_completed',
      'rankings_submitted',
      'mutual_selection_completed'
    ],
    phase3: [
      'relationship_goals_set',
      'communication_training_completed',
      'milestone_tracking_started',
      'coaching_session_completed'
    ]
  };

  private constructor(phase: Phase, startedAt: Date = new Date()) {
    this.validatePhase(phase);
    this.currentPhase = phase;
    this.startedAt = startedAt;
    this.completedSteps = new Set<string>();
  }

  static create(phase: Phase, startedAt: Date = new Date()): PhaseStatus {
    return new PhaseStatus(phase, startedAt);
  }

  getCurrentPhase(): Phase {
    return this.currentPhase;
  }

  getStartedAt(): Date {
    return new Date(this.startedAt);
  }

  getCompletedSteps(): readonly string[] {
    return Array.from(this.completedSteps);
  }

  completeStep(step: string): void {
    if (!PhaseStatus.REQUIRED_STEPS[this.currentPhase].includes(step)) {
      throw new Error(`Invalid step "${step}" for phase "${this.currentPhase}"`);
    }
    this.completedSteps.add(step);
  }

  isStepCompleted(step: string): boolean {
    return this.completedSteps.has(step);
  }

  getRemainingSteps(): string[] {
    return PhaseStatus.REQUIRED_STEPS[this.currentPhase].filter(
      step => !this.completedSteps.has(step)
    );
  }

  getProgress(): number {
    const totalSteps = PhaseStatus.REQUIRED_STEPS[this.currentPhase].length;
    const completedCount = this.completedSteps.size;
    return (completedCount / totalSteps) * 100;
  }

  canAdvance(): boolean {
    const requiredSteps = PhaseStatus.REQUIRED_STEPS[this.currentPhase];
    return requiredSteps.every(step => this.completedSteps.has(step));
  }

  advance(): PhaseStatus {
    if (!this.canAdvance()) {
      throw new Error('Cannot advance phase: required steps not completed');
    }

    const currentIndex = PhaseStatus.PHASE_ORDER.indexOf(this.currentPhase);
    if (currentIndex === PhaseStatus.PHASE_ORDER.length - 1) {
      throw new Error('Already in final phase');
    }

    return PhaseStatus.create(PhaseStatus.PHASE_ORDER[currentIndex + 1]);
  }

  private validatePhase(phase: Phase): void {
    if (!PhaseStatus.PHASE_ORDER.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }
  }

  equals(other: PhaseStatus): boolean {
    if (!(other instanceof PhaseStatus)) {
      return false;
    }

    return (
      this.currentPhase === other.currentPhase &&
      this.startedAt.getTime() === other.startedAt.getTime() &&
      this.getCompletedSteps().every(step => other.isStepCompleted(step)) &&
      other.getCompletedSteps().every(step => this.isStepCompleted(step))
    );
  }

  toString(): string {
    return `${this.currentPhase} (${this.getProgress()}% complete)`;
  }

  static getPhases(): Phase[] {
    return [...PhaseStatus.PHASE_ORDER];
  }

  static getRequiredSteps(phase: Phase): string[] {
    return [...PhaseStatus.REQUIRED_STEPS[phase]];
  }
} 