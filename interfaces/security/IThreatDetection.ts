// Security threat detection interface

interface IThreatDetection {
    detectThreats(): Promise<any[]>;

    // get threats
    getThreats(): Promise<any[]>;
    getThreat(id: any): Promise<any>;
    getThreatsByUser(user: any): Promise<any[]>;
    getThreatsByDate(date: any): Promise<any[]>;
    getThreatsByType(type: any): Promise<any[]>;
    getThreatsByLevel(level: any): Promise<any[]>;
    getThreatsByStatus(status: any): Promise<any[]>;
}
