import { EventEmitter } from 'events';

// Import from PaymentService.ts
import { PaymentTransaction, PaymentStatus } from './PaymentService';

/**
 * Configuration options for the micropayment engine
 */
export interface MicropaymentEngineOptions {
  minPaymentAmount?: number;
  maxPaymentAmount?: number;
  batchingEnabled?: boolean;
  batchingThreshold?: number;
  batchingInterval?: number; // in milliseconds
}

/**
 * Handles small value transactions efficiently by potentially batching them
 * and optimizing for low overhead
 */
export class MicropaymentEngine extends EventEmitter {
  private pendingBatch: Map<string, PaymentTransaction[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  
  private options: Required<MicropaymentEngineOptions> = {
    minPaymentAmount: 0.001,
    maxPaymentAmount: 5.0,
    batchingEnabled: true,
    batchingThreshold: 10,
    batchingInterval: 60000, // 1 minute
  };

  constructor(options: MicropaymentEngineOptions = {}) {
    super();
    this.options = { ...this.options, ...options };
  }

  /**
   * Process a micropayment transaction
   */
  public async processPayment(transaction: PaymentTransaction): Promise<void> {
    // Validate transaction amount for micropayments
    if (transaction.amount < this.options.minPaymentAmount) {
      throw new Error(`Payment amount too small: ${transaction.amount}`);
    }
    
    if (transaction.amount > this.options.maxPaymentAmount) {
      throw new Error(`Payment amount too large for micropayment: ${transaction.amount}`);
    }
    
    // If batching is enabled and amount is small enough, consider batching
    if (this.options.batchingEnabled && 
        transaction.amount <= this.options.maxPaymentAmount / 2) {
      return this.handleBatchedPayment(transaction);
    }
    
    // Otherwise process immediately
    return this.executePayment(transaction);
  }

  /**
   * Handle a payment that may be batched with others
   */
  private async handleBatchedPayment(transaction: PaymentTransaction): Promise<void> {
    const batchKey = `${transaction.senderId}-${transaction.recipientId}`;
    
    // Initialize batch if needed
    if (!this.pendingBatch.has(batchKey)) {
      this.pendingBatch.set(batchKey, []);
      
      // Set up batch timer
      this.batchTimers.set(
        batchKey,
        setTimeout(() => {
          this.processBatch(batchKey);
        }, this.options.batchingInterval)
      );
    }
    
    // Add to batch
    const batch = this.pendingBatch.get(batchKey)!;
    batch.push(transaction);
    
    // Process immediately if threshold reached
    if (batch.length >= this.options.batchingThreshold) {
      // Clear the timer
      const timer = this.batchTimers.get(batchKey);
      if (timer) {
        clearTimeout(timer);
        this.batchTimers.delete(batchKey);
      }
      
      // Process the batch
      await this.processBatch(batchKey);
    }
    
    this.emit('micropayment:queued', transaction);
  }

  /**
   * Process a batch of payments between the same sender and recipient
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.pendingBatch.get(batchKey);
    if (!batch || batch.length === 0) return;
    
    // Remove from pending
    this.pendingBatch.delete(batchKey);
    
    try {
      // Sum up the total amount
      const totalAmount = batch.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Get sender and recipient from first transaction (they're the same for all in batch)
      const { senderId, recipientId } = batch[0];
      
      // Execute the combined payment
      await this.executeBatchPayment({
        senderId,
        recipientId,
        amount: totalAmount,
        transactions: batch,
      });
      
      // Mark all transactions as completed
      batch.forEach(tx => {
        tx.status = PaymentStatus.COMPLETED;
        this.emit('micropayment:completed', tx);
      });
      
      this.emit('batch:completed', batch);
    } catch (error) {
      // Mark all transactions as failed
      batch.forEach(tx => {
        tx.status = PaymentStatus.FAILED;
        tx.metadata = {
          ...tx.metadata,
          error: error instanceof Error ? error.message : 'Unknown error',
          batchFailed: true,
        };
        this.emit('micropayment:failed', tx, error);
      });
      
      this.emit('batch:failed', batch, error);
      throw error;
    }
  }

  /**
   * Execute a single micropayment
   */
  private async executePayment(transaction: PaymentTransaction): Promise<void> {
    try {
      // In a real implementation, this would interact with a payment protocol
      // For now, we'll simulate a successful payment
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.emit('micropayment:processed', transaction);
    } catch (error) {
      this.emit('micropayment:error', transaction, error);
      throw error;
    }
  }

  /**
   * Execute a batched payment
   */
  private async executeBatchPayment(batchInfo: {
    senderId: string;
    recipientId: string;
    amount: number;
    transactions: PaymentTransaction[];
  }): Promise<void> {
    try {
      // In a real implementation, this would interact with a payment protocol
      // For now, we'll simulate a successful payment
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      this.emit('batch:processed', batchInfo);
    } catch (error) {
      this.emit('batch:error', batchInfo, error);
      throw error;
    }
  }

  /**
   * Cancel all pending batched payments
   */
  public cancelAllPendingBatches(): void {
    // Clear all timers
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
    
    // Get all pending transactions
    const allPendingTransactions: PaymentTransaction[] = [];
    this.pendingBatch.forEach(batch => {
      allPendingTransactions.push(...batch);
    });
    
    // Clear batches
    this.pendingBatch.clear();
    
    // Emit cancellation event
    this.emit('batches:cancelled', allPendingTransactions);
  }
}