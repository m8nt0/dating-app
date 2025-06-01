// Real-time communication interface

interface IWebSocket {
    connect(connection: any): Promise<void>;
    disconnect(connection: any): Promise<void>;
    sendMessage(message: any): Promise<void>;
}