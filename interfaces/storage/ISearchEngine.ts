// Full-text search interface

interface ISearchEngine {
    search(query: string): Promise<any[]>;
    index(data: any): Promise<void>;
    update(id: string, data: any): Promise<void>;
    delete(id: string): Promise<void>;  
}


