// Background job processing interface

interface ITaskQueue {
    addTask(task: any): Promise<void>;
    getTask(): Promise<any>;
    deleteTask(task: any): Promise<void>;
}