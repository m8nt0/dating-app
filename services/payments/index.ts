/**
 * Payment Service Module
 * 
 * This module provides comprehensive payment functionality for the decentralized dating app,
 * including in-app credits, micropayments, resource tracking, and external payment processing.
 */

// Export main payment service
export { 
  PaymentService,
  PaymentType,
  PaymentStatus,
  PaymentTransaction,
  PaymentServiceOptions,
} from './PaymentService';

// Export micropayment engine
export {
  MicropaymentEngine,
  MicropaymentEngineOptions,
} from './MicropaymentEngine';

// Export credit tracker
export {
  CreditTracker,
  CreditTransactionType,
  CreditTransaction,
  CreditTrackerOptions,
} from './CreditTracker';

// Export resource tracker
export {
  ResourceTracker,
  ResourceType,
  ResourceUsage,
  ResourceExchange,
  ResourceTrackerOptions,
} from './ResourceTracker';

// Export payment gateway
export {
  PaymentGateway,
  PaymentProvider,
  PaymentMethodType,
  PaymentMethod,
  PaymentGatewayOptions,
} from './PaymentGateway';

// Default export for easier importing
import { PaymentService } from './PaymentService';
export default PaymentService;
