// Calendar and event intergration
// soley for Phase 3
interface IEventService {
    getEvents(): Promise<any[]>;
    getEvent(id: any): Promise<any>;
    getEventsByUser(user: any): Promise<any[]>;
    getEventsByDate(date: any): Promise<any[]>;
    getEventsByType(type: any): Promise<any[]>;
}