/**
 * Messaging API interface
 */

/**
 * Message data
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'location' | 'contact' | 'system';
  content: string;
  encryptionType?: 'none' | 'e2ee' | 'forward-secrecy';
  metadata?: {
    mediaType?: string;
    mediaDuration?: number;
    mediaSize?: number;
    mediaWidth?: number;
    mediaHeight?: number;
    ipfsCid?: string;
    locationData?: {
      latitude?: number;
      longitude?: number;
      name?: string;
      address?: string;
    };
  };
  replyToId?: string;
  sentAt: string;
  receivedAt?: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  expiresAt?: string;
  reactions?: Array<{
    userId: string;
    reaction: string;
    createdAt: string;
  }>;
  signature?: string;
}

/**
 * Conversation data
 */
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'blocked';
  metadata?: {
    name?: string;
    avatar?: string;
    isGroup?: boolean;
    groupAdmin?: string;
    matchId?: string;
    topic?: string;
  };
  settings?: {
    muted?: boolean;
    encrypted?: boolean;
    ephemeral?: boolean;
    ephemeralTtl?: number;
    pinned?: boolean;
  };
}

/**
 * Message filter options
 */
export interface MessageFilterOptions {
  conversationId?: string;
  senderId?: string;
  recipientId?: string;
  types?: Message['type'][];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
}

/**
 * Messaging API interface
 */
export interface IMessagingAPI {
  /**
   * Get conversations for the current user
   */
  getConversations(options?: {
    status?: Conversation['status'] | Conversation['status'][];
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<Conversation[]>;
  
  /**
   * Get a specific conversation
   */
  getConversation(conversationId: string): Promise<Conversation>;
  
  /**
   * Create a new conversation
   */
  createConversation(
    participants: string[],
    metadata?: Conversation['metadata'],
    settings?: Conversation['settings']
  ): Promise<Conversation>;
  
  /**
   * Update conversation settings
   */
  updateConversation(
    conversationId: string,
    updates: {
      status?: Conversation['status'];
      metadata?: Partial<Conversation['metadata']>;
      settings?: Partial<Conversation['settings']>;
    }
  ): Promise<Conversation>;
  
  /**
   * Get messages in a conversation
   */
  getMessages(options: MessageFilterOptions): Promise<Message[]>;
  
  /**
   * Send a message
   */
  sendMessage(
    conversationId: string,
    type: Message['type'],
    content: string | Blob | File,
    metadata?: Partial<Message['metadata']>,
    options?: {
      replyToId?: string;
      expireAfter?: number;
      priority?: number;
    }
  ): Promise<Message>;
  
  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageIds?: string[]): Promise<boolean>;
  
  /**
   * Delete a message
   */
  deleteMessage(messageId: string, forEveryone?: boolean): Promise<boolean>;
  
  /**
   * React to a message
   */
  reactToMessage(messageId: string, reaction: string): Promise<Message>;
  
  /**
   * Remove a reaction from a message
   */
  removeReaction(messageId: string): Promise<Message>;
  
  /**
   * Get typing status
   */
  getTypingStatus(conversationId: string): Promise<{
    userId: string;
    isTyping: boolean;
    timestamp: string;
  }[]>;
  
  /**
   * Set typing status
   */
  setTypingStatus(conversationId: string, isTyping: boolean): Promise<boolean>;
  
  /**
   * Search messages
   */
  searchMessages(query: string, options?: {
    conversationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
} 