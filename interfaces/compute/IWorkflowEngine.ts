// Business workflow orchestration

interface IWorkflowEngine {
    startWorkflow(workflow: any): Promise<void>;
    stopWorkflow(workflow: any): Promise<void>;
    getWorkflowStatus(workflow: any): Promise<any>;
    getWorkflowHistory(workflow: any): Promise<any>;
    getWorkflowLogs(workflow: any): Promise<any>;
    getWorkflowMetrics(workflow: any): Promise<any>;
    getWorkflowAlerts(workflow: any): Promise<any>;
    getWorkflowNotifications(workflow: any): Promise<any>;
}
