/**
 * Messaging Service
 * 
 * Orchestrates messaging functionality including sending, receiving,
 * and managing conversations and messages.
 */

import { EventEmitter } from 'events';
import { 
  Message, 
  Conversation, 
  MessageStatus, 
  MessageType,
  MessageFilterOptions 
} from '../../protocol/api/IMessaging';
import { EncryptedChannel } from './EncryptedChannel';
import { MediaSharingService } from './MediaSharingService';

export interface MessagingServiceOptions {
  /**
   * Enable end-to-end encryption
   */
  enableEncryption?: boolean;
  
  /**
   * Enable message delivery receipts
   */
  enableDeliveryReceipts?: boolean;
  
  /**
   * Enable read receipts
   */
  enableReadReceipts?: boolean;
  
  /**
   * Enable typing indicators
   */
  enableTypingIndicators?: boolean;
  
  /**
   * Enable media sharing
   */
  enableMediaSharing?: boolean;
  
  /**
   * Maximum message size in bytes
   */
  maxMessageSize?: number;
  
  /**
   * Maximum media size in bytes
   */
  maxMediaSize?: number;
}

export class MessagingService extends EventEmitter {
  private userId: string;
  private options: Required<MessagingServiceOptions>;
  private encryptedChannels: Map<string, EncryptedChannel> = new Map();
  private mediaService: MediaSharingService | null = null;
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  
  constructor(userId: string, options: MessagingServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      enableEncryption: true,
      enableDeliveryReceipts: true,
      enableReadReceipts: true,
      enableTypingIndicators: true,
      enableMediaSharing: true,
      maxMessageSize: 10 * 1024, // 10KB
      maxMediaSize: 10 * 1024 * 1024, // 10MB
      ...options
    };
    
    if (this.options.enableMediaSharing) {
      this.mediaService = new MediaSharingService({
        maxFileSize: this.options.maxMediaSize
      });
    }
  }
  
  /**
   * Initialize the messaging service
   */
  async initialize(): Promise<void> {
    // Set up network listeners for incoming messages
    this.setupNetworkListeners();
    
    // Initialize media service if enabled
    if (this.mediaService) {
      await this.mediaService.initialize();
    }
    
    // Load conversations from storage
    await this.loadConversations();
  }
  
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    return conversation;
  }
  
  /**
   * Create a new conversation or get an existing one
   */
  async createConversation(participants: string[]): Promise<Conversation> {
    // Make sure the current user is included
    if (!participants.includes(this.userId)) {
      participants = [this.userId, ...participants];
    }
    
    // Check if a conversation already exists with these participants
    const existingConversation = Array.from(this.conversations.values()).find(
      conv => {
        const sameParticipants = conv.participants.every(p => participants.includes(p)) &&
                                participants.every(p => conv.participants.includes(p));
        return sameParticipants;
      }
    );
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create a new conversation
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      participants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: null,
      unreadCount: 0,
      type: participants.length > 2 ? 'group' : 'direct'
    };
    
    // Set up encrypted channel if encryption is enabled
    if (this.options.enableEncryption) {
      const channel = new EncryptedChannel(conversation.id, participants);
      await channel.initialize();
      this.encryptedChannels.set(conversation.id, channel);
    }
    
    // Store the conversation
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
    
    // Emit event
    this.emit('conversation-created', conversation);
    
    return conversation;
  }
  
  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = 'text',
    attachments: File[] = []
  ): Promise<Message> {
    const conversation = await this.getConversation(conversationId);
    
    // Check message size
    if (content.length > this.options.maxMessageSize) {
      throw new Error(`Message exceeds maximum size of ${this.options.maxMessageSize} bytes`);
    }
    
    // Process attachments if any
    let attachmentMetadata: Record<string, any>[] = [];
    
    if (attachments.length > 0 && this.mediaService) {
      attachmentMetadata = await Promise.all(
        attachments.map(file => this.mediaService!.uploadMedia(file))
      );
    }
    
    // Create the message
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      senderId: this.userId,
      content,
      type,
      sentAt: new Date().toISOString(),
      status: 'sending',
      attachments: attachmentMetadata,
      reactions: []
    };
    
    // Add to local message store
    const conversationMessages = this.messages.get(conversationId) || [];
    conversationMessages.push(message);
    this.messages.set(conversationId, conversationMessages);
    
    // Update conversation last message
    conversation.lastMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      sentAt: message.sentAt,
      type: message.type
    };
    conversation.updatedAt = message.sentAt;
    this.conversations.set(conversationId, conversation);
    
    // Encrypt the message if encryption is enabled
    let encryptedContent: string | null = null;
    if (this.options.enableEncryption) {
      const channel = this.encryptedChannels.get(conversationId);
      if (channel) {
        encryptedContent = await channel.encryptMessage(content);
      }
    }
    
    // Send the message over the network
    try {
      await this.sendMessageOverNetwork(message, encryptedContent);
      
      // Update message status to sent
      message.status = 'sent';
      this.emit('message-sent', message);
      
    } catch (error) {
      message.status = 'failed';
      this.emit('message-failed', { message, error });
    }
    
    return message;
  }
  
  /**
   * Get messages from a conversation
   */
  async getMessages(
    conversationId: string,
    options: MessageFilterOptions = {}
  ): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId);
    const messages = this.messages.get(conversationId) || [];
    
    // Apply filters
    let filteredMessages = messages;
    
    if (options.beforeId) {
      const beforeIndex = messages.findIndex(msg => msg.id === options.beforeId);
      if (beforeIndex !== -1) {
        filteredMessages = messages.slice(0, beforeIndex);
      }
    }
    
    if (options.afterId) {
      const afterIndex = messages.findIndex(msg => msg.id === options.afterId);
      if (afterIndex !== -1) {
        filteredMessages = messages.slice(afterIndex + 1);
      }
    }
    
    if (options.senderId) {
      filteredMessages = filteredMessages.filter(msg => msg.senderId === options.senderId);
    }
    
    if (options.types && options.types.length > 0) {
      filteredMessages = filteredMessages.filter(msg => options.types!.includes(msg.type));
    }
    
    // Apply limit and sort
    const limit = options.limit || 50;
    
    return filteredMessages
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit);
  }
  
  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    const messages = this.messages.get(conversationId) || [];
    
    // Determine which messages to mark as read
    const messagesToMark = messageIds 
      ? messages.filter(msg => messageIds.includes(msg.id) && msg.senderId !== this.userId)
      : messages.filter(msg => msg.status !== 'read' && msg.senderId !== this.userId);
    
    // Update message status
    messagesToMark.forEach(message => {
      message.status = 'read';
      message.readAt = new Date().toISOString();
    });
    
    // Reset unread count
    if (!messageIds) {
      conversation.unreadCount = 0;
      this.conversations.set(conversationId, conversation);
    }
    
    // Send read receipts if enabled
    if (this.options.enableReadReceipts && messagesToMark.length > 0) {
      await this.sendReadReceipts(conversationId, messagesToMark.map(msg => msg.id));
    }
    
    this.emit('messages-read', { conversationId, messageIds: messagesToMark.map(msg => msg.id) });
  }
  
  /**
   * Delete a message
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<boolean> {
    const messages = this.messages.get(conversationId) || [];
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return false;
    }
    
    // Check if the user is the sender
    const message = messages[messageIndex];
    if (message.senderId !== this.userId) {
      throw new Error('Cannot delete a message sent by another user');
    }
    
    // Remove the message
    messages.splice(messageIndex, 1);
    this.messages.set(conversationId, messages);
    
    // Send delete notification over the network
    await this.sendMessageDeleteNotification(conversationId, messageId);
    
    this.emit('message-deleted', { conversationId, messageId });
    return true;
  }
  
  /**
   * React to a message
   */
  async reactToMessage(
    conversationId: string,
    messageId: string,
    reaction: string
  ): Promise<void> {
    const messages = this.messages.get(conversationId) || [];
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }
    
    // Check if the user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.userId === this.userId && r.reaction === reaction
    );
    
    if (existingReaction) {
      // Remove the reaction
      message.reactions = message.reactions.filter(
        r => !(r.userId === this.userId && r.reaction === reaction)
      );
    } else {
      // Add the reaction
      message.reactions.push({
        userId: this.userId,
        reaction,
        timestamp: new Date().toISOString()
      });
    }
    
    // Send reaction update over the network
    await this.sendReactionUpdate(conversationId, messageId, reaction, !existingReaction);
    
    this.emit('message-reaction', { 
      conversationId, 
      messageId, 
      userId: this.userId, 
      reaction, 
      added: !existingReaction 
    });
  }
  
  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.options.enableTypingIndicators) {
      return;
    }
    
    // Send typing indicator over the network
    await this.sendTypingIndicatorOverNetwork(conversationId, isTyping);
  }
  
  /**
   * Leave a group conversation
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    
    if (conversation.type !== 'group') {
      throw new Error('Cannot leave a direct conversation');
    }
    
    // Remove user from participants
    conversation.participants = conversation.participants.filter(p => p !== this.userId);
    
    // Add system message
    await this.sendMessage(
      conversationId,
      `${this.userId} left the conversation`,
      'system'
    );
    
    // Send leave notification over the network
    await this.sendLeaveConversationNotification(conversationId);
    
    // If encryption is enabled, clean up the channel
    if (this.options.enableEncryption) {
      const channel = this.encryptedChannels.get(conversationId);
      if (channel) {
        await channel.dispose();
        this.encryptedChannels.delete(conversationId);
      }
    }
    
    this.emit('conversation-left', { conversationId, userId: this.userId });
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
    
    // Clean up encrypted channels
    for (const channel of this.encryptedChannels.values()) {
      await channel.dispose();
    }
    
    // Clean up media service
    if (this.mediaService) {
      await this.mediaService.dispose();
    }
  }
  
  // Private methods
  
  private async loadConversations(): Promise<void> {
    // In a real implementation, this would load from storage
    // For now, we'll just initialize empty maps
    this.conversations = new Map();
    this.messages = new Map();
  }
  
  private setupNetworkListeners(): void {
    // In a real implementation, this would set up network listeners
    // For now, we'll just simulate with some mock events
    
    // Simulate receiving a message after 5 seconds
    setTimeout(() => {
      this.handleIncomingMessage({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        conversationId: 'mock_conversation',
        senderId: 'mock_user',
        content: 'Hello! This is a simulated incoming message.',
        type: 'text',
        sentAt: new Date().toISOString(),
        status: 'delivered',
        attachments: [],
        reactions: []
      });
    }, 5000);
  }
  
  private async handleIncomingMessage(message: Message): Promise<void> {
    // Check if we have the conversation
    let conversation = this.conversations.get(message.conversationId);
    
    if (!conversation) {
      // Create a new conversation
      conversation = {
        id: message.conversationId,
        participants: [this.userId, message.senderId],
        createdAt: message.sentAt,
        updatedAt: message.sentAt,
        lastMessage: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          sentAt: message.sentAt,
          type: message.type
        },
        unreadCount: 1,
        type: 'direct'
      };
      
      this.conversations.set(conversation.id, conversation);
      this.messages.set(conversation.id, []);
      
      // Set up encrypted channel if encryption is enabled
      if (this.options.enableEncryption) {
        const channel = new EncryptedChannel(conversation.id, conversation.participants);
        await channel.initialize();
        this.encryptedChannels.set(conversation.id, channel);
      }
      
      this.emit('conversation-created', conversation);
    } else {
      // Update conversation
      conversation.updatedAt = message.sentAt;
      conversation.lastMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        sentAt: message.sentAt,
        type: message.type
      };
      conversation.unreadCount++;
      this.conversations.set(conversation.id, conversation);
    }
    
    // Decrypt the message if encryption is enabled
    if (this.options.enableEncryption && message.metadata?.encrypted) {
      const channel = this.encryptedChannels.get(message.conversationId);
      if (channel) {
        message.content = await channel.decryptMessage(message.content);
      }
    }
    
    // Add to messages
    const messages = this.messages.get(message.conversationId) || [];
    messages.push(message);
    this.messages.set(message.conversationId, messages);
    
    // Send delivery receipt if enabled
    if (this.options.enableDeliveryReceipts) {
      await this.sendDeliveryReceipt(message.conversationId, message.id);
    }
    
    // Emit event
    this.emit('message-received', message);
  }
  
  private async sendMessageOverNetwork(message: Message, encryptedContent: string | null): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    
    if (encryptedContent) {
      message.content = encryptedContent;
      message.metadata = { ...message.metadata, encrypted: true };
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate success
    return Promise.resolve();
  }
  
  private async sendDeliveryReceipt(conversationId: string, messageId: string): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
  
  private async sendReadReceipts(conversationId: string, messageIds: string[]): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
  
  private async sendMessageDeleteNotification(conversationId: string, messageId: string): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
  
  private async sendReactionUpdate(
    conversationId: string,
    messageId: string,
    reaction: string,
    added: boolean
  ): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
  
  private async sendTypingIndicatorOverNetwork(conversationId: string, isTyping: boolean): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
  
  private async sendLeaveConversationNotification(conversationId: string): Promise<void> {
    // In a real implementation, this would send over the network
    // For now, we'll just simulate success
    return Promise.resolve();
  }
}
