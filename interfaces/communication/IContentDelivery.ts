// CDN and content delivery interface

interface IContentDelivery {
    deliver(content: any): Promise<void>;
    receiveContent(content: any): Promise<void>;
}
