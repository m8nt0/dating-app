// Multi-device data synchronization

interface IDataSync {
    sync(data: any): Promise<void>;
    receive(data: any): Promise<void>;
    resolveConflicts(conflicts: any[]): Promise<void>;
}


