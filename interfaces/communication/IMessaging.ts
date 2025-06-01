// Instant messaging interface

interface IMessaging {
    sendMessage(message: any): Promise<void>;
    receiveMessage(message: any): Promise<void>;
}
