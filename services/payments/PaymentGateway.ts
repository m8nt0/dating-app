import { EventEmitter } from 'events';
import { PaymentTransaction, PaymentStatus } from './PaymentService';

/**
 * Supported payment providers
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
}

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  isDefault: boolean;
  metadata: Record<string, any>;
  lastUsed?: number;
  createdAt: number;
}

/**
 * Payment gateway options
 */
export interface PaymentGatewayOptions {
  enabledProviders?: PaymentProvider[];
  defaultProvider?: PaymentProvider;
  testMode?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

/**
 * Handles external payment processing through various payment providers
 */
export class PaymentGateway extends EventEmitter {
  private paymentMethods: Map<string, PaymentMethod[]> = new Map();
  private providerClients: Map<PaymentProvider, any> = new Map();
  private processingTransactions: Map<string, { 
    transaction: PaymentTransaction;
    attempts: number;
    lastAttempt: number;
  }> = new Map();
  
  private options: Required<PaymentGatewayOptions> = {
    enabledProviders: [
      PaymentProvider.STRIPE,
      PaymentProvider.PAYPAL,
      PaymentProvider.CRYPTO,
    ],
    defaultProvider: PaymentProvider.STRIPE,
    testMode: false,
    autoRetry: true,
    maxRetries: 3,
  };
  
  constructor(options: PaymentGatewayOptions = {}) {
    super();
    this.options = { ...this.options, ...options };
    this.initializeProviders();
  }
  
  /**
   * Initialize payment provider clients
   */
  private initializeProviders(): void {
    // In a real implementation, this would initialize actual payment provider SDKs
    // For now, we'll just simulate the initialization
    
    this.options.enabledProviders.forEach(provider => {
      // Simulate provider client
      this.providerClients.set(provider, {
        name: provider,
        isTestMode: this.options.testMode,
        processPayment: async (transaction: PaymentTransaction) => {
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Simulate success with 95% probability in non-test mode
          // In test mode, we'll simulate failures more frequently for testing
          const successRate = this.options.testMode ? 0.7 : 0.95;
          const isSuccessful = Math.random() < successRate;
          
          if (!isSuccessful) {
            throw new Error(`Payment processing failed with ${provider}`);
          }
          
          return {
            providerTransactionId: `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'succeeded',
            processingFee: transaction.amount * 0.029 + 0.30, // Simulate typical processing fee
          };
        }
      });
      
      this.emit('provider:initialized', provider);
    });
  }
  
  /**
   * Process a payment transaction through an external payment provider
   */
  public async processPayment(transaction: PaymentTransaction): Promise<void> {
    // Determine which provider to use
    const provider = this.determineProvider(transaction);
    
    if (!this.providerClients.has(provider)) {
      throw new Error(`Payment provider ${provider} not initialized`);
    }
    
    // Track processing attempt
    this.trackProcessingAttempt(transaction);
    
    try {
      const providerClient = this.providerClients.get(provider);
      
      // Process the payment through the provider
      const result = await providerClient.processPayment(transaction);
      
      // Update transaction with provider information
      transaction.metadata = {
        ...transaction.metadata,
        provider,
        providerTransactionId: result.providerTransactionId,
        processingFee: result.processingFee,
      };
      
      // Remove from processing list
      this.processingTransactions.delete(transaction.id);
      
      this.emit('payment:processed', transaction, result);
    } catch (error) {
      const processingInfo = this.processingTransactions.get(transaction.id);
      
      if (processingInfo && 
          this.options.autoRetry && 
          processingInfo.attempts < this.options.maxRetries) {
        // Schedule retry
        setTimeout(() => {
          this.retryPayment(transaction);
        }, this.calculateRetryDelay(processingInfo.attempts));
        
        this.emit('payment:retry-scheduled', transaction, processingInfo.attempts + 1);
      } else {
        // Max retries reached or auto-retry disabled
        this.processingTransactions.delete(transaction.id);
        this.emit('payment:failed', transaction, error);
        throw error;
      }
    }
  }
  
  /**
   * Add a payment method for a user
   */
  public addPaymentMethod(
    userId: string,
    type: PaymentMethodType,
    provider: PaymentProvider,
    metadata: Record<string, any>,
    isDefault: boolean = false
  ): PaymentMethod {
    // Validate provider is enabled
    if (!this.options.enabledProviders.includes(provider)) {
      throw new Error(`Payment provider ${provider} is not enabled`);
    }
    
    // Initialize user payment methods if needed
    if (!this.paymentMethods.has(userId)) {
      this.paymentMethods.set(userId, []);
    }
    
    const userPaymentMethods = this.paymentMethods.get(userId)!;
    
    // If this is the default method, unset any existing default
    if (isDefault) {
      userPaymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }
    
    // Create new payment method
    const paymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      provider,
      isDefault: isDefault || userPaymentMethods.length === 0, // First method is default
      metadata,
      createdAt: Date.now(),
    };
    
    userPaymentMethods.push(paymentMethod);
    this.emit('payment-method:added', paymentMethod);
    
    return paymentMethod;
  }
  
  /**
   * Get payment methods for a user
   */
  public getPaymentMethods(userId: string): PaymentMethod[] {
    return this.paymentMethods.get(userId) || [];
  }
  
  /**
   * Set a payment method as default
   */
  public setDefaultPaymentMethod(userId: string, paymentMethodId: string): boolean {
    const userPaymentMethods = this.paymentMethods.get(userId);
    
    if (!userPaymentMethods) {
      return false;
    }
    
    // Find the payment method
    const paymentMethod = userPaymentMethods.find(pm => pm.id === paymentMethodId);
    
    if (!paymentMethod) {
      return false;
    }
    
    // Update default status
    userPaymentMethods.forEach(pm => {
      pm.isDefault = pm.id === paymentMethodId;
    });
    
    this.emit('payment-method:default-updated', userId, paymentMethodId);
    return true;
  }
  
  /**
   * Remove a payment method
   */
  public removePaymentMethod(userId: string, paymentMethodId: string): boolean {
    const userPaymentMethods = this.paymentMethods.get(userId);
    
    if (!userPaymentMethods) {
      return false;
    }
    
    const initialLength = userPaymentMethods.length;
    const wasDefault = userPaymentMethods.find(pm => pm.id === paymentMethodId)?.isDefault || false;
    
    // Remove the payment method
    const filteredMethods = userPaymentMethods.filter(pm => pm.id !== paymentMethodId);
    
    if (filteredMethods.length === initialLength) {
      // No method was removed
      return false;
    }
    
    // Update the list
    this.paymentMethods.set(userId, filteredMethods);
    
    // If the removed method was default, set a new default if any methods remain
    if (wasDefault && filteredMethods.length > 0) {
      filteredMethods[0].isDefault = true;
    }
    
    this.emit('payment-method:removed', userId, paymentMethodId);
    return true;
  }
  
  /**
   * Determine which provider to use for a transaction
   */
  private determineProvider(transaction: PaymentTransaction): PaymentProvider {
    // Check if a specific provider is requested in metadata
    if (transaction.metadata?.provider && 
        this.options.enabledProviders.includes(transaction.metadata.provider)) {
      return transaction.metadata.provider;
    }
    
    // Check if the user has a default payment method
    const userPaymentMethods = this.paymentMethods.get(transaction.senderId);
    if (userPaymentMethods && userPaymentMethods.length > 0) {
      const defaultMethod = userPaymentMethods.find(pm => pm.isDefault);
      if (defaultMethod) {
        return defaultMethod.provider;
      }
    }
    
    // Fall back to default provider
    return this.options.defaultProvider;
  }
  
  /**
   * Track a processing attempt for a transaction
   */
  private trackProcessingAttempt(transaction: PaymentTransaction): void {
    if (!this.processingTransactions.has(transaction.id)) {
      this.processingTransactions.set(transaction.id, {
        transaction,
        attempts: 0,
        lastAttempt: Date.now(),
      });
    }
    
    const processingInfo = this.processingTransactions.get(transaction.id)!;
    processingInfo.attempts += 1;
    processingInfo.lastAttempt = Date.now();
  }
  
  /**
   * Calculate delay for retry based on attempt number
   */
  private calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 2^n * 1000ms
    return Math.pow(2, attemptNumber) * 1000;
  }
  
  /**
   * Retry a failed payment
   */
  private async retryPayment(transaction: PaymentTransaction): Promise<void> {
    // Try a different provider for the retry if available
    const currentProvider = transaction.metadata?.provider;
    
    if (currentProvider && this.options.enabledProviders.length > 1) {
      // Find an alternative provider
      const alternativeProvider = this.options.enabledProviders.find(
        p => p !== currentProvider
      );
      
      if (alternativeProvider) {
        transaction.metadata = {
          ...transaction.metadata,
          provider: alternativeProvider,
          previousProvider: currentProvider,
        };
      }
    }
    
    // Process the payment again
    await this.processPayment(transaction);
  }
}
