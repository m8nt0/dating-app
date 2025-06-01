// Peer-to-peer networking interface

interface IP2PNetwork {
    connect(connection: any): Promise<void>;
    disconnect(connection: any): Promise<void>;
    sendMessage(message: any): Promise<void>;
}