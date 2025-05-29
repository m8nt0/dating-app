/**
 * WebRTC direct connections
 */

/**
 * WebRTC connection configuration
 */
export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  maxRetries?: number;
  timeout?: number;
  mediaConstraints?: MediaStreamConstraints;
}

/**
 * Connection state
 */
export enum ConnectionState {
  NEW = 'new',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  CLOSED = 'closed'
}

/**
 * Connection events
 */
export enum ConnectionEvent {
  STATE_CHANGE = 'state_change',
  DATA_CHANNEL = 'data_channel',
  ICE_CANDIDATE = 'ice_candidate',
  TRACK = 'track',
  DATA = 'data',
  ERROR = 'error'
}

/**
 * WebRTC peer connection interface
 */
export interface IWebRTCConnection {
  /**
   * Get the connection ID
   */
  getId(): string;
  
  /**
   * Initialize a connection
   */
  init(config: WebRTCConfig): Promise<void>;
  
  /**
   * Create an offer
   */
  createOffer(): Promise<RTCSessionDescriptionInit>;
  
  /**
   * Set remote description (answer)
   */
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  
  /**
   * Handle an incoming offer
   */
  handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  
  /**
   * Add ICE candidate
   */
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  
  /**
   * Create a data channel
   */
  createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel;
  
  /**
   * Send data through a data channel
   */
  sendData(data: string | ArrayBuffer | Blob, channelLabel?: string): Promise<void>;
  
  /**
   * Add a media track
   */
  addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender;
  
  /**
   * Close the connection
   */
  close(): void;
  
  /**
   * Get connection state
   */
  getState(): ConnectionState;
  
  /**
   * Add event listener
   */
  on(event: ConnectionEvent, callback: (data: any) => void): void;
  
  /**
   * Remove event listener
   */
  off(event: ConnectionEvent, callback: (data: any) => void): void;
}