/**
 * Games Service
 * 
 * Manages interactive games between users, including game selection,
 * state management, and synchronization.
 */

import { EventEmitter } from 'events';
import { GameRegistry } from './GameRegistry';
import { GameSession } from './GameSession';
import { GameType, GameState, GameResult } from './types';

export interface GamesServiceOptions {
  /**
   * Maximum number of concurrent game sessions
   */
  maxConcurrentSessions?: number;
  
  /**
   * Enable game history tracking
   */
  enableHistory?: boolean;
  
  /**
   * Enable game achievements
   */
  enableAchievements?: boolean;
}

export interface GameInvite {
  id: string;
  gameType: GameType;
  senderId: string;
  recipientId: string;
  sentAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface GameHistoryEntry {
  sessionId: string;
  gameType: GameType;
  participants: string[];
  startedAt: string;
  endedAt?: string;
  result?: GameResult;
}

export class GamesService extends EventEmitter {
  private userId: string;
  private gameRegistry: GameRegistry;
  private activeSessions: Map<string, GameSession> = new Map();
  private pendingInvites: Map<string, GameInvite> = new Map();
  private gameHistory: GameHistoryEntry[] = [];
  private options: Required<GamesServiceOptions>;
  private inviteExpiryInterval: NodeJS.Timeout | null = null;
  
  constructor(userId: string, options: GamesServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      maxConcurrentSessions: 5,
      enableHistory: true,
      enableAchievements: true,
      ...options
    };
    
    this.gameRegistry = new GameRegistry();
  }
  
  /**
   * Initialize the games service
   */
  async initialize(): Promise<void> {
    // Register available games
    await this.gameRegistry.initialize();
    
    // Start invite expiry checker
    this.startInviteExpiryChecker();
    
    // Load game history if enabled
    if (this.options.enableHistory) {
      await this.loadGameHistory();
    }
  }
  
  /**
   * Get available game types
   */
  getAvailableGames(): GameType[] {
    return this.gameRegistry.getAvailableGames();
  }
  
  /**
   * Send a game invite to another user
   */
  async sendGameInvite(gameType: GameType, recipientId: string): Promise<GameInvite> {
    // Check if game type is available
    if (!this.gameRegistry.isGameAvailable(gameType)) {
      throw new Error(`Game type ${gameType} is not available`);
    }
    
    // Check if we've reached the maximum number of concurrent sessions
    if (this.activeSessions.size >= this.options.maxConcurrentSessions) {
      throw new Error(`Maximum number of concurrent game sessions reached (${this.options.maxConcurrentSessions})`);
    }
    
    // Create the invite
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // Expires in 5 minutes
    
    const invite: GameInvite = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      gameType,
      senderId: this.userId,
      recipientId,
      sentAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending'
    };
    
    // Store the invite
    this.pendingInvites.set(invite.id, invite);
    
    // Emit event
    this.emit('game-invite-sent', invite);
    
    return invite;
  }
  
  /**
   * Accept a game invite
   */
  async acceptGameInvite(inviteId: string): Promise<GameSession> {
    // Get the invite
    const invite = this.pendingInvites.get(inviteId);
    if (!invite) {
      throw new Error(`Game invite ${inviteId} not found`);
    }
    
    // Check if the invite is still valid
    if (invite.status !== 'pending') {
      throw new Error(`Game invite ${inviteId} is ${invite.status}`);
    }
    
    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = 'expired';
      this.emit('game-invite-expired', invite);
      throw new Error(`Game invite ${inviteId} has expired`);
    }
    
    // Check if we've reached the maximum number of concurrent sessions
    if (this.activeSessions.size >= this.options.maxConcurrentSessions) {
      throw new Error(`Maximum number of concurrent game sessions reached (${this.options.maxConcurrentSessions})`);
    }
    
    // Update invite status
    invite.status = 'accepted';
    
    // Create a new game session
    const gameInstance = this.gameRegistry.createGameInstance(invite.gameType);
    const session = new GameSession(
      invite.gameType,
      [invite.senderId, invite.recipientId],
      gameInstance
    );
    
    // Initialize the session
    await session.initialize();
    
    // Store the session
    this.activeSessions.set(session.id, session);
    
    // Set up session event listeners
    this.setupSessionEventListeners(session);
    
    // Add to game history if enabled
    if (this.options.enableHistory) {
      this.addGameHistoryEntry({
        sessionId: session.id,
        gameType: invite.gameType,
        participants: [invite.senderId, invite.recipientId],
        startedAt: new Date().toISOString()
      });
    }
    
    // Emit event
    this.emit('game-session-started', {
      sessionId: session.id,
      gameType: invite.gameType,
      participants: [invite.senderId, invite.recipientId]
    });
    
    return session;
  }
  
  /**
   * Decline a game invite
   */
  async declineGameInvite(inviteId: string): Promise<void> {
    // Get the invite
    const invite = this.pendingInvites.get(inviteId);
    if (!invite) {
      throw new Error(`Game invite ${inviteId} not found`);
    }
    
    // Check if the invite is still valid
    if (invite.status !== 'pending') {
      throw new Error(`Game invite ${inviteId} is already ${invite.status}`);
    }
    
    // Update invite status
    invite.status = 'declined';
    
    // Emit event
    this.emit('game-invite-declined', invite);
  }
  
  /**
   * Get active game sessions
   */
  getActiveGameSessions(): GameSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  /**
   * Get a specific game session
   */
  getGameSession(sessionId: string): GameSession | undefined {
    return this.activeSessions.get(sessionId);
  }
  
  /**
   * Join an existing game session
   */
  async joinGameSession(sessionId: string): Promise<GameSession> {
    // Get the session
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Game session ${sessionId} not found`);
    }
    
    // Add the user to the session
    await session.addParticipant(this.userId);
    
    return session;
  }
  
  /**
   * Leave a game session
   */
  async leaveGameSession(sessionId: string): Promise<void> {
    // Get the session
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }
    
    // Remove the user from the session
    await session.removeParticipant(this.userId);
    
    // If no participants left, end the session
    if (session.getParticipants().length === 0) {
      await this.endGameSession(sessionId);
    }
  }
  
  /**
   * Make a move in a game
   */
  async makeGameMove(sessionId: string, move: any): Promise<GameState> {
    // Get the session
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Game session ${sessionId} not found`);
    }
    
    // Make the move
    return await session.makeMove(this.userId, move);
  }
  
  /**
   * End a game session
   */
  async endGameSession(sessionId: string): Promise<void> {
    // Get the session
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }
    
    // End the session
    await session.end();
    
    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    
    // Update game history if enabled
    if (this.options.enableHistory) {
      this.updateGameHistoryEntry(sessionId, {
        endedAt: new Date().toISOString(),
        result: session.getResult()
      });
    }
    
    // Emit event
    this.emit('game-session-ended', {
      sessionId,
      gameType: session.gameType,
      result: session.getResult()
    });
  }
  
  /**
   * Get game history
   */
  getGameHistory(): GameHistoryEntry[] {
    if (!this.options.enableHistory) {
      return [];
    }
    
    return [...this.gameHistory];
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // End all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      await this.endGameSession(sessionId);
    }
    
    // Stop invite expiry checker
    if (this.inviteExpiryInterval) {
      clearInterval(this.inviteExpiryInterval);
      this.inviteExpiryInterval = null;
    }
    
    // Remove all event listeners
    this.removeAllListeners();
  }
  
  // Private helper methods
  
  /**
   * Start the invite expiry checker
   */
  private startInviteExpiryChecker(): void {
    this.inviteExpiryInterval = setInterval(() => {
      const now = new Date();
      
      // Check for expired invites
      for (const [inviteId, invite] of this.pendingInvites.entries()) {
        if (invite.status === 'pending' && new Date(invite.expiresAt) < now) {
          invite.status = 'expired';
          this.emit('game-invite-expired', invite);
        }
      }
      
      // Clean up old invites
      for (const [inviteId, invite] of this.pendingInvites.entries()) {
        if (invite.status !== 'pending') {
          // Keep non-pending invites for a while, then remove them
          const inviteSentAt = new Date(invite.sentAt);
          if ((now.getTime() - inviteSentAt.getTime()) > 24 * 60 * 60 * 1000) { // 24 hours
            this.pendingInvites.delete(inviteId);
          }
        }
      }
    }, 60 * 1000); // Check every minute
  }
  
  /**
   * Set up event listeners for a game session
   */
  private setupSessionEventListeners(session: GameSession): void {
    // Listen for game state changes
    session.on('state-changed', (state: GameState) => {
      this.emit('game-state-changed', {
        sessionId: session.id,
        gameType: session.gameType,
        state
      });
    });
    
    // Listen for game end
    session.on('game-ended', (result: GameResult) => {
      // Update game history if enabled
      if (this.options.enableHistory) {
        this.updateGameHistoryEntry(session.id, {
          endedAt: new Date().toISOString(),
          result
        });
      }
      
      // Process achievements if enabled
      if (this.options.enableAchievements) {
        this.processAchievements(session.gameType, result);
      }
      
      // Remove from active sessions
      this.activeSessions.delete(session.id);
      
      // Emit event
      this.emit('game-session-ended', {
        sessionId: session.id,
        gameType: session.gameType,
        result
      });
    });
  }
  
  /**
   * Load game history
   */
  private async loadGameHistory(): Promise<void> {
    // In a real implementation, this would load from storage
    // For now, we'll just initialize an empty array
    this.gameHistory = [];
  }
  
  /**
   * Add a game history entry
   */
  private addGameHistoryEntry(entry: GameHistoryEntry): void {
    this.gameHistory.push(entry);
    
    // In a real implementation, this would save to storage
  }
  
  /**
   * Update a game history entry
   */
  private updateGameHistoryEntry(sessionId: string, updates: Partial<GameHistoryEntry>): void {
    const entry = this.gameHistory.find(e => e.sessionId === sessionId);
    if (entry) {
      Object.assign(entry, updates);
      
      // In a real implementation, this would save to storage
    }
  }
  
  /**
   * Process achievements
   */
  private processAchievements(gameType: GameType, result: GameResult): void {
    // In a real implementation, this would check for achievements and award them
    // For now, we'll just simulate this
    if (result.winnerId === this.userId) {
      this.emit('achievement-unlocked', {
        userId: this.userId,
        achievementId: `${gameType}_winner`,
        name: `${gameType} Winner`,
        description: `Won a game of ${gameType}`,
        unlockedAt: new Date().toISOString()
      });
    }
  }
} 