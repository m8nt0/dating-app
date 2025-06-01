// Security audit logging interface

interface IAuditLog {
    log(message: any): Promise<any>;
    getLogs(): Promise<any[]>;
    getLog(id: any): Promise<any>;
    getLogsByUser(user: any): Promise<any[]>;
    getLogsByDate(date: any): Promise<any[]>;
    getLogsByType(type: any): Promise<any[]>;
    getLogsByLevel(level: any): Promise<any[]>;
    getLogsByStatus(status: any): Promise<any[]>;
    
}
