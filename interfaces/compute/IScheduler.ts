// Task scheduling interface

interface IScheduler {
    schedule(task: any): Promise<void>;
    getTask(): Promise<any>;
    deleteTask(task: any): Promise<void>;
    updateTask(task: any): Promise<void>;
    getTaskStatus(task: any): Promise<any>;
}