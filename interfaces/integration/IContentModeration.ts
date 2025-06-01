// Content moderation service interface

interface IContentModeration {
    moderateContent(content: any): Promise<any>;
    getModerationStatus(id: any): Promise<any>;
    getModerationHistory(id: any): Promise<any[]>;
    getModerationByUser(user: any): Promise<any[]>;
    getModerationByDate(date: any): Promise<any[]>;
    getModerationByType(type: any): Promise<any[]>;
    getModerationByStatus(status: any): Promise<any[]>;
}