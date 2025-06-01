// Graph relationships interface

interface IGraphDatabase {
    createNode(node: any): Promise<any>;
    createEdge(edge: any): Promise<any>;
    deleteNode(id: string): Promise<void>;
}

