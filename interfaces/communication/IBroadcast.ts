// Group broadcasting interface

interface IBroadcast {
    broadcast(message: any): Promise<void>;
    receiveBroadcast(message: any): Promise<void>;
}
