// Distributed locking mechanism

interface IDistributedLock {
    lock(key: string): Promise<void>;
    unlock(key: string): Promise<void>;
}
