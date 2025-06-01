// Event sourcing storage interface

interface IEventStore {
    append(event: any): Promise<void>;
    getEvents(id: string): Promise<any[]>;
}
