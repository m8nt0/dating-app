// Push notifications interface

interface INotification {
    sendNotification(notification: any): Promise<void>;
    receiveNotification(notification: any): Promise<void>;
    getNotificationStatus(notification: any): Promise<any>;
    getNotificationHistory(notification: any): Promise<any>;
    getNotificationMetrics(notification: any): Promise<any>;
}
