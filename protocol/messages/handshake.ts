/**
 * Handshake protocol for establishing peer connections
 */
/**
 * Handshake message purpose
 */
export enum HandshakePurpose {
  HELLO = 'hello',
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice_candidate',
  RENEGOTIATE = 'renegotiate',
  CLOSE = 'close'
}

/**
 * Base handshake message interface
 */
export interface HandshakeMessage {
  type: MessageType.HANDSHAKE;
  purpose: HandshakePurpose;
  peerId: string;
  sessionId: string;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

/**
 * Hello handshake message
 */
export interface HelloMessage extends HandshakeMessage {
  purpose: HandshakePurpose.HELLO;
  capabilities: {
    protocols: string[];
    features: string[];
    version: string;
  };
  publicKey: string;
}

/**
 * WebRTC offer message
 */
export interface OfferMessage extends HandshakeMessage {
  purpose: HandshakePurpose.OFFER;
  offer: RTCSessionDescriptionInit;
  connectionId: string;
}

/**
 * WebRTC answer message
 */
export interface AnswerMessage extends HandshakeMessage {
  purpose: HandshakePurpose.ANSWER;
  answer: RTCSessionDescriptionInit;
  connectionId: string;
}

/**
 * ICE candidate message
 */
export interface IceCandidateMessage extends HandshakeMessage {
  purpose: HandshakePurpose.ICE_CANDIDATE;
  candidate: RTCIceCandidateInit;
  connectionId: string;
}

/**
 * Connection renegotiation message
 */
export interface RenegotiateMessage extends HandshakeMessage {
  purpose: HandshakePurpose.RENEGOTIATE;
  connectionId: string;
  reason: string;
}

/**
 * Connection close message
 */
export interface CloseMessage extends HandshakeMessage {
  purpose: HandshakePurpose.CLOSE;
  connectionId: string;
  reason?: string;
}

/**
 * Create a hello message
 */
export function createHelloMessage(
  peerId: string,
  sessionId: string,
  capabilities: HelloMessage['capabilities'],
  publicKey: string
): HelloMessage {
  return {
    type: MessageType.HANDSHAKE,
    purpose: HandshakePurpose.HELLO,
    peerId,
    sessionId,
    timestamp: Date.now(),
    capabilities,
    publicKey
  };
}

/**
 * Create an offer message
 */
export function createOfferMessage(
  peerId: string,
  sessionId: string,
  connectionId: string,
  offer: RTCSessionDescriptionInit
): OfferMessage {
  return {
    type: MessageType.HANDSHAKE,
    purpose: HandshakePurpose.OFFER,
    peerId,
    sessionId,
    connectionId,
    timestamp: Date.now(),
    offer
  };
}

/**
 * Create an answer message
 */
export function createAnswerMessage(
  peerId: string,
  sessionId: string,
  connectionId: string,
  answer: RTCSessionDescriptionInit
): AnswerMessage {
  return {
    type: MessageType.HANDSHAKE,
    purpose: HandshakePurpose.ANSWER,
    peerId,
    sessionId,
    connectionId,
    timestamp: Date.now(),
    answer
  };
}

/**
 * Create an ICE candidate message
 */
export function createIceCandidateMessage(
  peerId: string,
  sessionId: string,
  connectionId: string,
  candidate: RTCIceCandidateInit
): IceCandidateMessage {
  return {
    type: MessageType.HANDSHAKE,
    purpose: HandshakePurpose.ICE_CANDIDATE,
    peerId,
    sessionId,
    connectionId,
    timestamp: Date.now(),
    candidate
  };
} 