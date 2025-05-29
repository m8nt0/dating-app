/**
 * Connection signaling for WebRTC
 */

/**
 * Signaling configuration
 */
export interface SignalingConfig {
  servers?: string[];
  reconnectInterval?: number;
  maxRetries?: number;
  timeout?: number;
  useRelays?: boolean;
}

/**
 * Signaling channel states
 */
export enum SignalingState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  FAILED = 'failed'
}

/**
 * Signaling message types
 */
export enum SignalingMessageType {
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice_candidate',
  CONNECTION_REQUEST = 'connection_request',
  DISCONNECTION = 'disconnection',
  ERROR = 'error'
}

/**
 * Signaling message
 */
export interface SignalingMessage {
  type: SignalingMessageType;
  senderId: string;
  recipientId?: string;
  connectionId?: string;
  payload: any;
  timestamp: number;
}

/**
 * Signaling service interface
 */
export interface ISignalingService {
  /**
   * Initialize the signaling service
   */
  init(config: SignalingConfig): Promise<void>;
  
  /**
   * Connect to signaling server
   */
  connect(): Promise<boolean>;
  
  /**
   * Disconnect from signaling server
   */
  disconnect(): Promise<void>;
  
  /**
   * Get current signaling state
   */
  getState(): SignalingState;
  
  /**
   * Send signaling message
   */
  send(message: SignalingMessage): Promise<boolean>;
  
  /**
   * Register message handler
   */
  onMessage(handler: (message: SignalingMessage) => void): void;
  
  /**
   * Remove message handler
   */
  offMessage(handler: (message: SignalingMessage) => void): void;
  
  /**
   * Register state change handler
   */
  onStateChange(handler: (state: SignalingState) => void): void;
  
  /**
   * Remove state change handler
   */
  offStateChange(handler: (state: SignalingState) => void): void;
  
  /**
   * Check if a peer is available
   */
  isPeerAvailable(peerId: string): Promise<boolean>;
}