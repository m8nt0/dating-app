/**
 * Games Service Types
 * 
 * Common type definitions for the games service.
 */

/**
 * Game type identifier
 */
export type GameType = 'tic-tac-toe' | 'connect-four' | 'rock-paper-scissors' | 'word-game' | 'quiz';

/**
 * Base game state interface
 */
export interface GameState {
  /**
   * Game type
   */
  gameType: GameType;
  
  /**
   * Current turn (user ID)
   */
  currentTurn: string | null;
  
  /**
   * Game status
   */
  status: 'waiting' | 'in-progress' | 'completed' | 'abandoned';
  
  /**
   * Game-specific state
   */
  data: any;
  
  /**
   * Last move timestamp
   */
  lastMoveAt?: string;
  
  /**
   * Game start timestamp
   */
  startedAt: string;
  
  /**
   * Game end timestamp (if completed)
   */
  endedAt?: string;
}

/**
 * Game result interface
 */
export interface GameResult {
  /**
   * Winner user ID (if any)
   */
  winnerId?: string;
  
  /**
   * Whether the game ended in a draw
   */
  isDraw: boolean;
  
  /**
   * Reason for the game ending
   */
  reason: 'win' | 'draw' | 'forfeit' | 'timeout' | 'abandoned';
  
  /**
   * Final score (if applicable)
   */
  score?: Record<string, number>;
  
  /**
   * Game-specific result data
   */
  data?: any;
}

/**
 * Game move interface
 */
export interface GameMove {
  /**
   * User ID making the move
   */
  userId: string;
  
  /**
   * Move timestamp
   */
  timestamp: string;
  
  /**
   * Move data (game-specific)
   */
  data: any;
}

/**
 * Game instance interface
 */
export interface GameInstance {
  /**
   * Initialize the game
   */
  initialize(participants: string[]): Promise<GameState>;
  
  /**
   * Process a move
   */
  processMove(userId: string, move: any): Promise<GameState>;
  
  /**
   * Check if a move is valid
   */
  isValidMove(userId: string, move: any): boolean;
  
  /**
   * Get the current game state
   */
  getState(): GameState;
  
  /**
   * Check if the game is over
   */
  isGameOver(): boolean;
  
  /**
   * Get the game result (if game is over)
   */
  getResult(): GameResult | null;
  
  /**
   * Add a participant to the game
   */
  addParticipant(userId: string): Promise<GameState>;
  
  /**
   * Remove a participant from the game
   */
  removeParticipant(userId: string): Promise<GameState>;
  
  /**
   * End the game
   */
  end(reason?: string): Promise<GameResult>;
}

/**
 * Game factory interface
 */
export interface GameFactory {
  /**
   * Game type
   */
  gameType: GameType;
  
  /**
   * Create a new game instance
   */
  createInstance(): GameInstance;
  
  /**
   * Get game metadata
   */
  getMetadata(): GameMetadata;
}

/**
 * Game metadata interface
 */
export interface GameMetadata {
  /**
   * Game type
   */
  type: GameType;
  
  /**
   * Game name
   */
  name: string;
  
  /**
   * Game description
   */
  description: string;
  
  /**
   * Minimum number of players
   */
  minPlayers: number;
  
  /**
   * Maximum number of players
   */
  maxPlayers: number;
  
  /**
   * Estimated duration in minutes
   */
  estimatedDuration: number;
  
  /**
   * Game categories
   */
  categories: string[];
  
  /**
   * Game thumbnail URL
   */
  thumbnailUrl?: string;
  
  /**
   * Game rules URL
   */
  rulesUrl?: string;
} 