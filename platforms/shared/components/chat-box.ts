/**
 * Chat Box Component
 * 
 * A framework-agnostic implementation of a chat box component
 * that can be adapted to different frontend frameworks.
 */

import { Message } from '../../../protocol/api/IMessaging';
import { Profile } from '../../../protocol/api/IProfile';

export interface ChatBoxOptions {
  /**
   * Show header with user info
   */
  showHeader?: boolean;
  
  /**
   * Show typing indicator
   */
  showTypingIndicator?: boolean;
  
  /**
   * Show message timestamps
   */
  showTimestamps?: boolean;
  
  /**
   * Enable message reactions
   */
  enableReactions?: boolean;
  
  /**
   * Enable file attachments
   */
  enableAttachments?: boolean;
  
  /**
   * Custom CSS classes
   */
  customClasses?: {
    container?: string;
    header?: string;
    messageList?: string;
    messageItem?: string;
    inputArea?: string;
  };
  
  /**
   * Event handlers
   */
  onSendMessage?: (text: string, attachments?: File[]) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, reaction: string) => void;
  onViewProfile?: (userId: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export interface ChatBoxData {
  /**
   * Conversation ID
   */
  conversationId: string;
  
  /**
   * Current user ID
   */
  currentUserId: string;
  
  /**
   * Other user's profile
   */
  otherUser: Partial<Profile>;
  
  /**
   * Messages in the conversation
   */
  messages: Message[];
  
  /**
   * Is the other user typing
   */
  isTyping?: boolean;
  
  /**
   * Is the other user online
   */
  isOnline?: boolean;
  
  /**
   * Last seen timestamp
   */
  lastSeen?: Date;
}

/**
 * Chat Box Component
 */
export class ChatBox {
  private options: ChatBoxOptions;
  private data: ChatBoxData;
  private element: HTMLElement | null = null;
  private messageListElement: HTMLElement | null = null;
  private inputElement: HTMLTextAreaElement | null = null;
  private typingTimeout: number | null = null;
  
  /**
   * Create a new chat box instance
   */
  constructor(data: ChatBoxData, options: ChatBoxOptions = {}) {
    this.data = data;
    this.options = {
      showHeader: true,
      showTypingIndicator: true,
      showTimestamps: true,
      enableReactions: true,
      enableAttachments: true,
      ...options
    };
  }
  
  /**
   * Render the chat box as HTML
   */
  render(): HTMLElement {
    const { otherUser } = this.data;
    
    // Create container element
    const container = document.createElement('div');
    container.className = `chat-box ${this.options.customClasses?.container || ''}`;
    container.dataset.conversationId = this.data.conversationId;
    
    // Create header if enabled
    if (this.options.showHeader) {
      const header = document.createElement('div');
      header.className = `chat-box-header ${this.options.customClasses?.header || ''}`;
      
      // Add user avatar
      if (otherUser.photos && otherUser.photos.length > 0) {
        const avatar = document.createElement('img');
        avatar.src = otherUser.photos[0].url;
        avatar.alt = `${otherUser.displayName || otherUser.username}'s photo`;
        avatar.className = 'chat-box-avatar';
        header.appendChild(avatar);
      }
      
      // Add user info
      const userInfo = document.createElement('div');
      userInfo.className = 'chat-box-user-info';
      
      const userName = document.createElement('h3');
      userName.textContent = otherUser.displayName || otherUser.username || '';
      userInfo.appendChild(userName);
      
      // Add online status
      const status = document.createElement('span');
      status.className = `chat-box-status ${this.data.isOnline ? 'online' : 'offline'}`;
      status.textContent = this.data.isOnline ? 'Online' : 'Offline';
      
      // Add last seen if offline and available
      if (!this.data.isOnline && this.data.lastSeen) {
        status.textContent += ` - Last seen ${this.formatLastSeen(this.data.lastSeen)}`;
      }
      
      userInfo.appendChild(status);
      header.appendChild(userInfo);
      
      container.appendChild(header);
    }
    
    // Create message list
    const messageList = document.createElement('div');
    messageList.className = `chat-box-messages ${this.options.customClasses?.messageList || ''}`;
    
    // Add messages
    this.data.messages.forEach(message => {
      const messageItem = this.createMessageElement(message);
      messageList.appendChild(messageItem);
    });
    
    // Add typing indicator if enabled and other user is typing
    if (this.options.showTypingIndicator && this.data.isTyping) {
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'chat-box-typing-indicator';
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      messageList.appendChild(typingIndicator);
    }
    
    this.messageListElement = messageList;
    container.appendChild(messageList);
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = `chat-box-input-area ${this.options.customClasses?.inputArea || ''}`;
    
    // Add attachment button if enabled
    if (this.options.enableAttachments) {
      const attachButton = document.createElement('button');
      attachButton.className = 'chat-box-attach-button';
      attachButton.innerHTML = '<span>📎</span>';
      attachButton.addEventListener('click', this.handleAttachmentClick.bind(this));
      inputArea.appendChild(attachButton);
    }
    
    // Add text input
    const textInput = document.createElement('textarea');
    textInput.className = 'chat-box-input';
    textInput.placeholder = 'Type a message...';
    textInput.addEventListener('input', this.handleInput.bind(this));
    textInput.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputElement = textInput;
    inputArea.appendChild(textInput);
    
    // Add send button
    const sendButton = document.createElement('button');
    sendButton.className = 'chat-box-send-button';
    sendButton.innerHTML = '<span>➤</span>';
    sendButton.addEventListener('click', this.handleSendClick.bind(this));
    inputArea.appendChild(sendButton);
    
    container.appendChild(inputArea);
    
    this.element = container;
    return container;
  }
  
  /**
   * Add a new message to the chat
   */
  addMessage(message: Message): void {
    this.data.messages.push(message);
    
    if (this.messageListElement) {
      const messageItem = this.createMessageElement(message);
      this.messageListElement.appendChild(messageItem);
      this.scrollToBottom();
    }
  }
  
  /**
   * Update the chat box data
   */
  update(data: Partial<ChatBoxData>): void {
    this.data = { ...this.data, ...data };
    
    if (this.element) {
      const newElement = this.render();
      this.element.replaceWith(newElement);
      this.element = newElement;
      this.scrollToBottom();
    }
  }
  
  /**
   * Set typing status
   */
  setTypingStatus(isTyping: boolean): void {
    this.data.isTyping = isTyping;
    
    if (this.messageListElement && this.options.showTypingIndicator) {
      // Remove existing typing indicator
      const existingIndicator = this.messageListElement.querySelector('.chat-box-typing-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }
      
      // Add new typing indicator if typing
      if (isTyping) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-box-typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        this.messageListElement.appendChild(typingIndicator);
        this.scrollToBottom();
      }
    }
  }
  
  /**
   * Create a message element
   */
  private createMessageElement(message: Message): HTMLElement {
    const isCurrentUser = message.senderId === this.data.currentUserId;
    
    const messageItem = document.createElement('div');
    messageItem.className = `chat-box-message ${isCurrentUser ? 'outgoing' : 'incoming'} ${this.options.customClasses?.messageItem || ''}`;
    messageItem.dataset.messageId = message.id;
    
    // Add message content
    const content = document.createElement('div');
    content.className = 'chat-box-message-content';
    
    // Handle different message types
    switch (message.type) {
      case 'text':
        content.textContent = message.content;
        break;
      case 'image':
        if (message.metadata?.ipfsCid) {
          const img = document.createElement('img');
          img.src = `ipfs://${message.metadata.ipfsCid}`;
          img.alt = 'Image';
          content.appendChild(img);
        }
        break;
      case 'system':
        messageItem.classList.add('system');
        content.textContent = message.content;
        break;
      default:
        content.textContent = message.content;
    }
    
    messageItem.appendChild(content);
    
    // Add timestamp if enabled
    if (this.options.showTimestamps && message.sentAt) {
      const timestamp = document.createElement('div');
      timestamp.className = 'chat-box-message-time';
      timestamp.textContent = this.formatTime(new Date(message.sentAt));
      messageItem.appendChild(timestamp);
    }
    
    // Add message status for outgoing messages
    if (isCurrentUser) {
      const status = document.createElement('div');
      status.className = 'chat-box-message-status';
      
      switch (message.status) {
        case 'sending':
          status.textContent = '⌛';
          break;
        case 'sent':
          status.textContent = '✓';
          break;
        case 'delivered':
          status.textContent = '✓✓';
          break;
        case 'read':
          status.textContent = '✓✓';
          status.classList.add('read');
          break;
        case 'failed':
          status.textContent = '❌';
          break;
      }
      
      messageItem.appendChild(status);
    }
    
    // Add reactions if enabled and present
    if (this.options.enableReactions && message.reactions && message.reactions.length > 0) {
      const reactions = document.createElement('div');
      reactions.className = 'chat-box-message-reactions';
      
      // Group reactions by type
      const reactionCounts: Record<string, number> = {};
      message.reactions.forEach(reaction => {
        reactionCounts[reaction.reaction] = (reactionCounts[reaction.reaction] || 0) + 1;
      });
      
      // Create reaction elements
      Object.entries(reactionCounts).forEach(([reaction, count]) => {
        const reactionElement = document.createElement('span');
        reactionElement.className = 'chat-box-reaction';
        reactionElement.textContent = `${reaction} ${count}`;
        reactions.appendChild(reactionElement);
      });
      
      messageItem.appendChild(reactions);
    }
    
    return messageItem;
  }
  
  /**
   * Handle input event
   */
  private handleInput(event: Event): void {
    if (this.options.onTypingStart) {
      this.options.onTypingStart();
    }
    
    // Clear existing timeout
    if (this.typingTimeout !== null) {
      window.clearTimeout(this.typingTimeout);
    }
    
    // Set new timeout
    this.typingTimeout = window.setTimeout(() => {
      if (this.options.onTypingStop) {
        this.options.onTypingStop();
      }
      this.typingTimeout = null;
    }, 1000);
  }
  
  /**
   * Handle keydown event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Send message on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  
  /**
   * Handle send button click
   */
  private handleSendClick(): void {
    this.sendMessage();
  }
  
  /**
   * Handle attachment button click
   */
  private handleAttachmentClick(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,audio/*';
    
    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0 && this.options.onSendMessage) {
        this.options.onSendMessage('', Array.from(input.files));
      }
    });
    
    input.click();
  }
  
  /**
   * Send a message
   */
  private sendMessage(): void {
    if (this.inputElement && this.inputElement.value.trim() && this.options.onSendMessage) {
      this.options.onSendMessage(this.inputElement.value.trim());
      this.inputElement.value = '';
      
      // Clear typing timeout
      if (this.typingTimeout !== null) {
        window.clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
      
      // Trigger typing stop
      if (this.options.onTypingStop) {
        this.options.onTypingStop();
      }
    }
  }
  
  /**
   * Scroll to the bottom of the message list
   */
  private scrollToBottom(): void {
    if (this.messageListElement) {
      this.messageListElement.scrollTop = this.messageListElement.scrollHeight;
    }
  }
  
  /**
   * Format time for display
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Format last seen time
   */
  private formatLastSeen(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

/**
 * Create a chat box factory for specific frameworks
 */
export function createChatBoxAdapter<T>(
  renderer: (chatBox: ChatBox, container: HTMLElement | string) => T
) {
  return (data: ChatBoxData, options: ChatBoxOptions = {}, container: HTMLElement | string) => {
    const chatBox = new ChatBox(data, options);
    return renderer(chatBox, container);
  };
}
