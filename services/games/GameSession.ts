/**
 * Game Session
 * 
 * Manages a game session between participants, handling game state,
 * moves, and game lifecycle.
 */

import { EventEmitter } from 'events';
import { GameType, GameState, GameResult, GameInstance, GameMove } from './types';

export class GameSession extends EventEmitter {
  /**
   * Unique session ID
   */
  readonly id: string;
  
  /**
   * Game type
   */
  readonly gameType: GameType;
  
  /**
   * Session participants
   */
  private participants: string[];
  
  /**
   * Game instance
   */
  private gameInstance: GameInstance;
  
  /**
   * Session creation timestamp
   */
  private createdAt: string;
  
  /**
   * Move history
   */
  private moves: GameMove[] = [];
  
  /**
   * Session status
   */
  private status: 'created' | 'active' | 'ended' = 'created';
  
  /**
   * Maximum idle time in milliseconds (5 minutes)
   */
  private readonly MAX_IDLE_TIME = 5 * 60 * 1000;
  
  /**
   * Idle timer
   */
  private idleTimer: NodeJS.Timeout | null = null;
  
  constructor(gameType: GameType, participants: string[], gameInstance: GameInstance) {
    super();
    this.id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.gameType = gameType;
    this.participants = [...participants];
    this.gameInstance = gameInstance;
    this.createdAt = new Date().toISOString();
  }
  
  /**
   * Initialize the game session
   */
  async initialize(): Promise<GameState> {
    // Initialize the game instance
    const initialState = await this.gameInstance.initialize(this.participants);
    
    // Set session status
    this.status = 'active';
    
    // Start idle timer
    this.resetIdleTimer();
    
    // Emit state change event
    this.emit('state-changed', initialState);
    
    return initialState;
  }
  
  /**
   * Make a move in the game
   */
  async makeMove(userId: string, move: any): Promise<GameState> {
    // Check if session is active
    if (this.status !== 'active') {
      throw new Error(`Cannot make move in ${this.status} session`);
    }
    
    // Check if user is a participant
    if (!this.participants.includes(userId)) {
      throw new Error(`User ${userId} is not a participant in this session`);
    }
    
    // Check if it's the user's turn
    const currentState = this.gameInstance.getState();
    if (currentState.currentTurn !== userId) {
      throw new Error(`It's not ${userId}'s turn`);
    }
    
    // Check if the move is valid
    if (!this.gameInstance.isValidMove(userId, move)) {
      throw new Error('Invalid move');
    }
    
    // Process the move
    const newState = await this.gameInstance.processMove(userId, move);
    
    // Record the move
    this.recordMove(userId, move);
    
    // Reset idle timer
    this.resetIdleTimer();
    
    // Check if game is over
    if (this.gameInstance.isGameOver()) {
      await this.handleGameOver();
    } else {
      // Emit state change event
      this.emit('state-changed', newState);
    }
    
    return newState;
  }
  
  /**
   * Add a participant to the game
   */
  async addParticipant(userId: string): Promise<GameState> {
    // Check if session is active
    if (this.status !== 'active') {
      throw new Error(`Cannot add participant to ${this.status} session`);
    }
    
    // Check if user is already a participant
    if (this.participants.includes(userId)) {
      return this.gameInstance.getState();
    }
    
    // Add participant to the game
    const newState = await this.gameInstance.addParticipant(userId);
    
    // Add to participants list
    this.participants.push(userId);
    
    // Emit participant added event
    this.emit('participant-added', { sessionId: this.id, userId });
    
    // Emit state change event
    this.emit('state-changed', newState);
    
    return newState;
  }
  
  /**
   * Remove a participant from the game
   */
  async removeParticipant(userId: string): Promise<GameState> {
    // Check if user is a participant
    if (!this.participants.includes(userId)) {
      return this.gameInstance.getState();
    }
    
    // Remove participant from the game
    const newState = await this.gameInstance.removeParticipant(userId);
    
    // Remove from participants list
    this.participants = this.participants.filter(id => id !== userId);
    
    // Emit participant removed event
    this.emit('participant-removed', { sessionId: this.id, userId });
    
    // If no participants left, end the session
    if (this.participants.length === 0) {
      await this.end('abandoned');
      return newState;
    }
    
    // If game is still active, emit state change event
    if (this.status === 'active') {
      this.emit('state-changed', newState);
    }
    
    return newState;
  }
  
  /**
   * End the game session
   */
  async end(reason?: string): Promise<void> {
    // Check if session is already ended
    if (this.status === 'ended') {
      return;
    }
    
    // Stop idle timer
    this.clearIdleTimer();
    
    // End the game
    const result = await this.gameInstance.end(reason);
    
    // Set session status
    this.status = 'ended';
    
    // Emit game ended event
    this.emit('game-ended', result);
  }
  
  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.gameInstance.getState();
  }
  
  /**
   * Get the game result (if game is over)
   */
  getResult(): GameResult | null {
    return this.gameInstance.getResult();
  }
  
  /**
   * Get session participants
   */
  getParticipants(): string[] {
    return [...this.participants];
  }
  
  /**
   * Get move history
   */
  getMoves(): GameMove[] {
    return [...this.moves];
  }
  
  /**
   * Get session status
   */
  getStatus(): 'created' | 'active' | 'ended' {
    return this.status;
  }
  
  // Private helper methods
  
  /**
   * Record a move
   */
  private recordMove(userId: string, moveData: any): void {
    const move: GameMove = {
      userId,
      timestamp: new Date().toISOString(),
      data: moveData
    };
    
    this.moves.push(move);
  }
  
  /**
   * Handle game over
   */
  private async handleGameOver(): Promise<void> {
    // Get the result
    const result = this.gameInstance.getResult();
    
    if (!result) {
      return; // Game is not actually over
    }
    
    // End the session
    await this.end(result.reason);
  }
  
  /**
   * Reset the idle timer
   */
  private resetIdleTimer(): void {
    // Clear any existing timer
    this.clearIdleTimer();
    
    // Set a new timer
    this.idleTimer = setTimeout(() => {
      // End the game due to inactivity
      this.end('timeout').catch(console.error);
    }, this.MAX_IDLE_TIME);
  }
  
  /**
   * Clear the idle timer
   */
  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
} 