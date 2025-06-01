// Data backup and recovery interface

interface IBackupStorage {
    backup(data: any): Promise<void>;
    restore(data: any): Promise<void>; 
}

