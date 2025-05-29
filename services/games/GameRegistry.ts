/**
 * Game Registry
 * 
 * Registers and manages available game types and factories.
 */

import { GameFactory, GameInstance, GameType, GameMetadata } from './types';
import { TicTacToeFactory } from './games/TicTacToeFactory';
import { ConnectFourFactory } from './games/ConnectFourFactory';
import { RockPaperScissorsFactory } from './games/RockPaperScissorsFactory';
import { WordGameFactory } from './games/WordGameFactory';
import { QuizGameFactory } from './games/QuizGameFactory';

export class GameRegistry {
  private factories: Map<GameType, GameFactory> = new Map();
  private metadata: Map<GameType, GameMetadata> = new Map();
  
  /**
   * Initialize the game registry
   */
  async initialize(): Promise<void> {
    // Register built-in games
    this.registerBuiltInGames();
  }
  
  /**
   * Register a game factory
   */
  registerGame(factory: GameFactory): void {
    const gameType = factory.gameType;
    this.factories.set(gameType, factory);
    this.metadata.set(gameType, factory.getMetadata());
  }
  
  /**
   * Unregister a game type
   */
  unregisterGame(gameType: GameType): boolean {
    const factoryRemoved = this.factories.delete(gameType);
    const metadataRemoved = this.metadata.delete(gameType);
    return factoryRemoved && metadataRemoved;
  }
  
  /**
   * Check if a game type is available
   */
  isGameAvailable(gameType: GameType): boolean {
    return this.factories.has(gameType);
  }
  
  /**
   * Get available game types
   */
  getAvailableGames(): GameType[] {
    return Array.from(this.factories.keys());
  }
  
  /**
   * Get metadata for a specific game type
   */
  getGameMetadata(gameType: GameType): GameMetadata | undefined {
    return this.metadata.get(gameType);
  }
  
  /**
   * Get metadata for all available games
   */
  getAllGameMetadata(): GameMetadata[] {
    return Array.from(this.metadata.values());
  }
  
  /**
   * Create a new game instance
   */
  createGameInstance(gameType: GameType): GameInstance {
    const factory = this.factories.get(gameType);
    if (!factory) {
      throw new Error(`Game type ${gameType} is not available`);
    }
    
    return factory.createInstance();
  }
  
  // Private helper methods
  
  /**
   * Register built-in games
   */
  private registerBuiltInGames(): void {
    // In a real implementation, these would be actual game factories
    // For now, we'll create simulated factories
    
    // Tic-tac-toe
    this.registerGame(new TicTacToeFactory());
    
    // Connect Four
    this.registerGame(new ConnectFourFactory());
    
    // Rock-Paper-Scissors
    this.registerGame(new RockPaperScissorsFactory());
    
    // Word Game
    this.registerGame(new WordGameFactory());
    
    // Quiz Game
    this.registerGame(new QuizGameFactory());
  }
} 