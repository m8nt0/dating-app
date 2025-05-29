/**
 * Usage-based micropayments system
 */

/**
 * Payment model
 */
export enum PaymentModel {
  PAY_PER_USE = 'pay_per_use',
  SUBSCRIPTION = 'subscription',
  TIPPING = 'tipping',
  STREAMING = 'streaming'
}

/**
 * Payment channel state
 */
export interface PaymentChannelState {
  channelId: string;
  sender: string;
  recipient: string;
  balance: number;
  totalSent: number;
  lastUpdated: number;
  isOpen: boolean;
  metadata?: Record<string, any>;
}

/**
 * Micropayment transaction
 */
export interface MicropaymentTransaction {
  id: string;
  channelId: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  model: PaymentModel;
  reason?: string;
  metadata?: Record<string, any>;
  signature?: string;
}

/**
 * Payment channel configuration
 */
export interface PaymentChannelConfig {
  initialDeposit: number;
  minPayment?: number;
  maxTotalPayment?: number;
  expiresAfter?: number;
  autoClose?: boolean;
}

/**
 * Micropayment service configuration
 */
export interface MicropaymentConfig {
  enabled: boolean;
  defaultModel: PaymentModel;
  channelConfigs?: Partial<Record<PaymentModel, PaymentChannelConfig>>;
  feePercentage?: number;
  minFee?: number;
  maxFee?: number;
  batchPayments?: boolean;
  batchInterval?: number;
}

/**
 * Micropayment service interface
 */
export interface IMicropaymentService {
  /**
   * Initialize the micropayment service
   */
  init(config: MicropaymentConfig): Promise<void>;
  
  /**
   * Open a payment channel
   */
  openChannel(
    sender: string,
    recipient: string,
    initialDeposit: number,
    model?: PaymentModel,
    metadata?: Record<string, any>
  ): Promise<PaymentChannelState>;
  
  /**
   * Make a payment through a channel
   */
  makePayment(
    channelId: string,
    amount: number,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<MicropaymentTransaction>;
  
  /**
   * Close a payment channel
   */
  closeChannel(channelId: string): Promise<{
    channelId: string;
    finalBalance: number;
    refundAmount: number;
  }>;
  
  /**
   * Get channel state
   */
  getChannelState(channelId: string): Promise<PaymentChannelState>;
  
  /**
   * Get all channels for a user
   */
  getUserChannels(userId: string, role?: 'sender' | 'recipient'): Promise<PaymentChannelState[]>;
  
  /**
   * Get channel transactions
   */
  getChannelTransactions(
    channelId: string,
    options?: {
      limit?: number;
      offset?: number;
      startTime?: number;
      endTime?: number;
    }
  ): Promise<MicropaymentTransaction[]>;
  
  /**
   * Estimate fee for a payment
   */
  estimateFee(amount: number, model?: PaymentModel): number;
  
  /**
   * Batch multiple payments (more efficient)
   */
  batchPayments(
    channelId: string,
    payments: Array<{
      amount: number;
      reason?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<MicropaymentTransaction[]>;
}