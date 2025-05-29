/**
 * Video Call Service
 * 
 * Manages video calls between users, including call setup, media handling,
 * and call optimization.
 */

import { EventEmitter } from 'events';
import { RTCManager } from './RTCManager';
import { CallOptimizer } from './CallOptimizer';

export interface VideoCallOptions {
  /**
   * Enable video
   */
  enableVideo?: boolean;
  
  /**
   * Enable audio
   */
  enableAudio?: boolean;
  
  /**
   * Enable screen sharing
   */
  enableScreenSharing?: boolean;
  
  /**
   * Enable call recording
   */
  enableRecording?: boolean;
  
  /**
   * Enable call optimization
   */
  enableOptimization?: boolean;
  
  /**
   * Maximum call duration in minutes (0 for unlimited)
   */
  maxCallDuration?: number;
  
  /**
   * Video quality preset
   */
  videoQuality?: 'low' | 'medium' | 'high' | 'auto';
  
  /**
   * Use secure mode (end-to-end encryption)
   */
  secureMode?: boolean;
}

export interface CallParticipant {
  id: string;
  name: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  joinedAt: string;
}

export interface CallStats {
  duration: number;
  bytesTransferred: number;
  avgBitrate: number;
  packetLoss: number;
  latency: number;
  resolution: {
    width: number;
    height: number;
  };
}

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected' | 'failed';

export class VideoCallService extends EventEmitter {
  private userId: string;
  private rtcManager: RTCManager;
  private callOptimizer: CallOptimizer | null = null;
  private options: Required<VideoCallOptions>;
  private callStatus: CallStatus = 'idle';
  private activeCallId: string | null = null;
  private participants: Map<string, CallParticipant> = new Map();
  private callStartTime: Date | null = null;
  private callDurationTimer: NodeJS.Timeout | null = null;
  
  constructor(userId: string, options: VideoCallOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      enableVideo: true,
      enableAudio: true,
      enableScreenSharing: true,
      enableRecording: false,
      enableOptimization: true,
      maxCallDuration: 0, // Unlimited
      videoQuality: 'auto',
      secureMode: false,
      ...options
    };
    
    this.rtcManager = new RTCManager({
      secureMode: this.options.secureMode
    });
    
    if (this.options.enableOptimization) {
      this.callOptimizer = new CallOptimizer();
    }
  }
  
  /**
   * Initialize the video call service
   */
  async initialize(): Promise<void> {
    await this.rtcManager.initialize();
    
    if (this.callOptimizer) {
      await this.callOptimizer.initialize();
    }
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Start a call with another user
   */
  async startCall(targetUserId: string, options?: Partial<VideoCallOptions>): Promise<string> {
    if (this.callStatus !== 'idle') {
      throw new Error(`Cannot start a call while in ${this.callStatus} state`);
    }
    
    // Merge options
    const callOptions = {
      ...this.options,
      ...options
    };
    
    // Generate a call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.activeCallId = callId;
    
    // Update call status
    this.setCallStatus('connecting');
    
    // Add self as participant
    this.addParticipant(this.userId, 'You');
    
    try {
      // Initialize RTC connection
      await this.rtcManager.createOffer(callId, targetUserId, {
        video: callOptions.enableVideo,
        audio: callOptions.enableAudio
      });
      
      // Set up call optimization if enabled
      if (this.callOptimizer && callOptions.enableOptimization) {
        this.callOptimizer.startOptimizing(callId, callOptions.videoQuality);
      }
      
      // Update call status
      this.setCallStatus('ringing');
      
      // Emit event
      this.emit('call-initiated', { callId, targetUserId });
      
      return callId;
    } catch (error) {
      this.handleCallError(error);
      throw error;
    }
  }
  
  /**
   * Answer an incoming call
   */
  async answerCall(callId: string, options?: Partial<VideoCallOptions>): Promise<void> {
    if (this.callStatus !== 'idle') {
      throw new Error(`Cannot answer a call while in ${this.callStatus} state`);
    }
    
    // Merge options
    const callOptions = {
      ...this.options,
      ...options
    };
    
    this.activeCallId = callId;
    
    // Update call status
    this.setCallStatus('connecting');
    
    // Add self as participant
    this.addParticipant(this.userId, 'You');
    
    try {
      // Accept the RTC connection
      const callerId = await this.rtcManager.acceptCall(callId, {
        video: callOptions.enableVideo,
        audio: callOptions.enableAudio
      });
      
      // Add caller as participant
      this.addParticipant(callerId, 'Caller');
      
      // Set up call optimization if enabled
      if (this.callOptimizer && callOptions.enableOptimization) {
        this.callOptimizer.startOptimizing(callId, callOptions.videoQuality);
      }
      
      // Start call timer
      this.startCallTimer();
      
      // Update call status
      this.setCallStatus('connected');
      
      // Emit event
      this.emit('call-answered', { callId, callerId });
    } catch (error) {
      this.handleCallError(error);
      throw error;
    }
  }
  
  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string, reason?: string): Promise<void> {
    await this.rtcManager.rejectCall(callId, reason);
    
    // Emit event
    this.emit('call-rejected', { callId, reason });
  }
  
  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    if (this.callStatus === 'idle' || !this.activeCallId) {
      return;
    }
    
    try {
      // Stop call optimization
      if (this.callOptimizer) {
        this.callOptimizer.stopOptimizing();
      }
      
      // End the RTC connection
      await this.rtcManager.endCall(this.activeCallId);
      
      // Stop call timer
      this.stopCallTimer();
      
      // Get call stats
      const stats = await this.getCallStats();
      
      // Update call status
      this.setCallStatus('disconnected');
      
      // Clear participants
      this.participants.clear();
      
      // Emit event
      this.emit('call-ended', { callId: this.activeCallId, stats });
      
      // Reset call state
      this.activeCallId = null;
      this.callStartTime = null;
      this.setCallStatus('idle');
    } catch (error) {
      console.error('Error ending call:', error);
      
      // Force reset call state
      this.activeCallId = null;
      this.callStartTime = null;
      this.participants.clear();
      this.setCallStatus('idle');
      
      throw error;
    }
  }
  
  /**
   * Toggle video
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot toggle video when not in a call');
    }
    
    await this.rtcManager.setVideoEnabled(enabled);
    
    // Update own participant state
    const ownParticipant = this.participants.get(this.userId);
    if (ownParticipant) {
      ownParticipant.videoEnabled = enabled;
      this.participants.set(this.userId, ownParticipant);
    }
    
    // Emit event
    this.emit('video-toggled', { userId: this.userId, enabled });
  }
  
  /**
   * Toggle audio
   */
  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot toggle audio when not in a call');
    }
    
    await this.rtcManager.setAudioEnabled(enabled);
    
    // Update own participant state
    const ownParticipant = this.participants.get(this.userId);
    if (ownParticipant) {
      ownParticipant.audioEnabled = enabled;
      this.participants.set(this.userId, ownParticipant);
    }
    
    // Emit event
    this.emit('audio-toggled', { userId: this.userId, enabled });
  }
  
  /**
   * Start screen sharing
   */
  async startScreenSharing(): Promise<void> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot start screen sharing when not in a call');
    }
    
    if (!this.options.enableScreenSharing) {
      throw new Error('Screen sharing is not enabled');
    }
    
    await this.rtcManager.startScreenSharing();
    
    // Update own participant state
    const ownParticipant = this.participants.get(this.userId);
    if (ownParticipant) {
      ownParticipant.screenSharing = true;
      this.participants.set(this.userId, ownParticipant);
    }
    
    // Emit event
    this.emit('screen-sharing-started', { userId: this.userId });
  }
  
  /**
   * Stop screen sharing
   */
  async stopScreenSharing(): Promise<void> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot stop screen sharing when not in a call');
    }
    
    await this.rtcManager.stopScreenSharing();
    
    // Update own participant state
    const ownParticipant = this.participants.get(this.userId);
    if (ownParticipant) {
      ownParticipant.screenSharing = false;
      this.participants.set(this.userId, ownParticipant);
    }
    
    // Emit event
    this.emit('screen-sharing-stopped', { userId: this.userId });
  }
  
  /**
   * Start call recording
   */
  async startRecording(): Promise<void> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot start recording when not in a call');
    }
    
    if (!this.options.enableRecording) {
      throw new Error('Recording is not enabled');
    }
    
    await this.rtcManager.startRecording();
    
    // Emit event
    this.emit('recording-started', { callId: this.activeCallId });
  }
  
  /**
   * Stop call recording
   */
  async stopRecording(): Promise<string> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot stop recording when not in a call');
    }
    
    const recordingUrl = await this.rtcManager.stopRecording();
    
    // Emit event
    this.emit('recording-stopped', { callId: this.activeCallId, recordingUrl });
    
    return recordingUrl;
  }
  
  /**
   * Get current call status
   */
  getCallStatus(): CallStatus {
    return this.callStatus;
  }
  
  /**
   * Get active call ID
   */
  getActiveCallId(): string | null {
    return this.activeCallId;
  }
  
  /**
   * Get call participants
   */
  getParticipants(): CallParticipant[] {
    return Array.from(this.participants.values());
  }
  
  /**
   * Get call duration in seconds
   */
  getCallDuration(): number {
    if (!this.callStartTime) {
      return 0;
    }
    
    return Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
  }
  
  /**
   * Get call statistics
   */
  async getCallStats(): Promise<CallStats> {
    if (this.callStatus !== 'connected' || !this.activeCallId) {
      throw new Error('Cannot get call stats when not in a call');
    }
    
    const rtcStats = await this.rtcManager.getStats();
    
    return {
      duration: this.getCallDuration(),
      bytesTransferred: rtcStats.bytesTransferred,
      avgBitrate: rtcStats.avgBitrate,
      packetLoss: rtcStats.packetLoss,
      latency: rtcStats.latency,
      resolution: rtcStats.resolution
    };
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // End any active call
    if (this.callStatus !== 'idle') {
      await this.endCall().catch(console.error);
    }
    
    // Clean up event listeners
    this.removeAllListeners();
    
    // Clean up RTC manager
    await this.rtcManager.dispose();
    
    // Clean up call optimizer
    if (this.callOptimizer) {
      await this.callOptimizer.dispose();
    }
  }
  
  // Private helper methods
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for incoming calls
    this.rtcManager.on('incoming-call', ({ callId, callerId }) => {
      this.emit('incoming-call', { callId, callerId });
    });
    
    // Listen for call accepted
    this.rtcManager.on('call-accepted', ({ callId, userId }) => {
      // Add the user as a participant
      this.addParticipant(userId, 'Participant');
      
      // Start call timer
      this.startCallTimer();
      
      // Update call status
      this.setCallStatus('connected');
      
      // Emit event
      this.emit('call-connected', { callId, userId });
    });
    
    // Listen for call rejected
    this.rtcManager.on('call-rejected', ({ callId, userId, reason }) => {
      // Update call status
      this.setCallStatus('disconnected');
      
      // Emit event
      this.emit('call-rejected', { callId, userId, reason });
      
      // Reset call state
      this.activeCallId = null;
      this.callStartTime = null;
      this.participants.clear();
      this.setCallStatus('idle');
    });
    
    // Listen for participant disconnected
    this.rtcManager.on('participant-disconnected', ({ callId, userId }) => {
      // Remove participant
      this.participants.delete(userId);
      
      // If no participants left, end the call
      if (this.participants.size <= 1) {
        this.endCall().catch(console.error);
      }
      
      // Emit event
      this.emit('participant-disconnected', { callId, userId });
    });
    
    // Listen for connection quality changes
    this.rtcManager.on('connection-quality-changed', ({ userId, quality }) => {
      // Update participant connection quality
      const participant = this.participants.get(userId);
      if (participant) {
        participant.connectionQuality = quality;
        this.participants.set(userId, participant);
      }
      
      // Emit event
      this.emit('connection-quality-changed', { userId, quality });
    });
    
    // Listen for media state changes
    this.rtcManager.on('media-state-changed', ({ userId, video, audio, screen }) => {
      // Update participant media state
      const participant = this.participants.get(userId);
      if (participant) {
        participant.videoEnabled = video;
        participant.audioEnabled = audio;
        participant.screenSharing = screen;
        this.participants.set(userId, participant);
      }
      
      // Emit event
      this.emit('media-state-changed', { userId, video, audio, screen });
    });
  }
  
  /**
   * Add a participant to the call
   */
  private addParticipant(userId: string, name: string): void {
    const participant: CallParticipant = {
      id: userId,
      name: name || userId,
      videoEnabled: userId === this.userId ? this.options.enableVideo : true,
      audioEnabled: userId === this.userId ? this.options.enableAudio : true,
      screenSharing: false,
      connectionQuality: 'good',
      joinedAt: new Date().toISOString()
    };
    
    this.participants.set(userId, participant);
    
    // Emit event
    this.emit('participant-joined', { callId: this.activeCallId, participant });
  }
  
  /**
   * Set call status
   */
  private setCallStatus(status: CallStatus): void {
    this.callStatus = status;
    this.emit('call-status-changed', { callId: this.activeCallId, status });
  }
  
  /**
   * Start call timer
   */
  private startCallTimer(): void {
    this.callStartTime = new Date();
    
    // Set up max duration timer if needed
    if (this.options.maxCallDuration > 0) {
      const maxDurationMs = this.options.maxCallDuration * 60 * 1000;
      this.callDurationTimer = setTimeout(() => {
        // End call when max duration is reached
        this.emit('max-duration-reached', { callId: this.activeCallId });
        this.endCall().catch(console.error);
      }, maxDurationMs);
    }
    
    // Emit duration updates every second
    const durationInterval = setInterval(() => {
      this.emit('duration-updated', { 
        callId: this.activeCallId, 
        duration: this.getCallDuration() 
      });
    }, 1000);
    
    // Store the interval so we can clear it later
    this.callDurationTimer = durationInterval as unknown as NodeJS.Timeout;
  }
  
  /**
   * Stop call timer
   */
  private stopCallTimer(): void {
    if (this.callDurationTimer) {
      clearTimeout(this.callDurationTimer);
      this.callDurationTimer = null;
    }
  }
  
  /**
   * Handle call error
   */
  private handleCallError(error: any): void {
    console.error('Call error:', error);
    
    // Update call status
    this.setCallStatus('failed');
    
    // Emit event
    this.emit('call-error', { 
      callId: this.activeCallId, 
      error: error.message || 'Unknown error' 
    });
    
    // Reset call state
    this.activeCallId = null;
    this.callStartTime = null;
    this.participants.clear();
    this.setCallStatus('idle');
  }
}
