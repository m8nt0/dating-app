// Regulatory compliance monitoring

interface IComplianceMonitor {
    monitorCompliance(): Promise<any>;
    getCompliance(): Promise<any[]>;
    getComplianceByUser(user: any): Promise<any[]>;
    getComplianceByDate(date: any): Promise<any[]>;
    getComplianceByType(type: any): Promise<any[]>;
}