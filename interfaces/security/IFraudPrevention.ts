// Fraud detection and prevention

interface IFraudPrevention {
    detectFraud(data: any): Promise<any>;
    getFraud(id: any): Promise<any>;
    getFrauds(): Promise<any[]>;
    getFraudsByUser(user: any): Promise<any[]>;
}