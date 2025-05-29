/**
 * Payment API interface
 */

/**
 * Payment data
 */
export interface Payment {
  id: string;
  channelId?: string;
  senderId: string;
  recipientId: string;
  amount: number;
  currency: string;
  type: 'tip' | 'subscription' | 'purchase' | 'refund' | 'credit' | 'resource';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  description?: string;
  itemId?: string;
  itemType?: string;
  metadata?: {
    appId?: string;
    sessionId?: string;
    deviceInfo?: Record<string, any>;
    notes?: string;
  };
  fees?: {
    processingFee?: number;
    platformFee?: number;
    networkFee?: number;
    total?: number;
  };
  refund?: {
    amount: number;
    reason?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    refundedAt?: string;
  };
  signature?: string;
  nonce?: string;
}

/**
 * Payment channel data
 */
export interface PaymentChannel {
  id: string;
  sender: string;
  recipient: string;
  balance: number;
  totalSent: number;
  lastUpdated: string;
  isOpen: boolean;
  metadata?: Record<string, any>;
}

/**
 * Balance data
 */
export interface Balance {
  total: number;
  available: number;
  pending: number;
  currency: string;
  lastUpdated: string;
  breakdown?: Record<string, number>;
}

/**
 * Payment filter options
 */
export interface PaymentFilterOptions {
  senderId?: string;
  recipientId?: string;
  type?: Payment['type'] | Payment['type'][];
  status?: Payment['status'] | Payment['status'][];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'amount' | 'completedAt';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Payment API interface
 */
export interface IPaymentAPI {
  /**
   * Get the current user's balance
   */
  getBalance(currency?: string): Promise<Balance>;
  
  /**
   * Make a payment
   */
  createPayment(
    recipientId: string,
    amount: number,
    currency: string,
    type: Payment['type'],
    description?: string,
    metadata?: Partial<Payment['metadata']>
  ): Promise<Payment>;
  
  /**
   * Get a payment by ID
   */
  getPayment(paymentId: string): Promise<Payment>;
  
  /**
   * Get payments with filters
   */
  getPayments(filter?: PaymentFilterOptions): Promise<Payment[]>;
  
  /**
   * Refund a payment
   */
  refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment>;
  
  /**
   * Cancel a pending payment
   */
  cancelPayment(paymentId: string, reason?: string): Promise<Payment>;
  
  /**
   * Open a payment channel
   */
  openPaymentChannel(
    recipientId: string,
    initialDeposit: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentChannel>;
  
  /**
   * Make a micropayment through a channel
   */
  makeChannelPayment(
    channelId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<Payment>;
  
  /**
   * Close a payment channel
   */
  closePaymentChannel(channelId: string): Promise<{
    channelId: string;
    finalBalance: number;
    refundAmount: number;
  }>;
  
  /**
   * Get payment channel by ID
   */
  getPaymentChannel(channelId: string): Promise<PaymentChannel>;
  
  /**
   * Get payment channels for the current user
   */
  getPaymentChannels(role?: 'sender' | 'recipient'): Promise<PaymentChannel[]>;
  
  /**
   * Get payment history for a channel
   */
  getChannelPayments(
    channelId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Payment[]>;
  
  /**
   * Get payment methods
   */
  getPaymentMethods(): Promise<Array<{
    id: string;
    type: string;
    provider: string;
    isDefault: boolean;
    metadata: Record<string, any>;
  }>>;
  
  /**
   * Add a payment method
   */
  addPaymentMethod(
    type: string,
    provider: string,
    token: string,
    setDefault?: boolean
  ): Promise<{
    id: string;
    type: string;
    provider: string;
    isDefault: boolean;
  }>;
} 