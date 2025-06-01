// Analytics computation interface

interface IAnalyticsEngine {
    compute(data: any): Promise<any>;
    analyze(data: any): Promise<any>;
    visualize(data: any): Promise<any>;
}