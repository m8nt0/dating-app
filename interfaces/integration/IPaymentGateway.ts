// Payment processing interface

interface IPaymentGateway {
    processPayment(amount: number): Promise<any>;
    getPaymentStatus(id: any): Promise<any>;
    getPayments(): Promise<any[]>;
    getPayment(id: any): Promise<any>;
    getPaymentsByUser(user: any): Promise<any[]>;
    getPaymentsByDate(date: any): Promise<any[]>;
    getPaymentsByType(type: any): Promise<any[]>;
    getPaymentsByStatus(status: any): Promise<any[]>;
}
