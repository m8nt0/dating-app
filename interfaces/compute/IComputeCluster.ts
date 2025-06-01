// Distributed computing interface

interface IComputeCluster {
    addNode(node: any): Promise<void>;
    removeNode(node: any): Promise<void>;
    getNode(node: any): Promise<any>;
}