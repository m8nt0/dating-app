// Device-specific API interface

interface IDeviceAPI {
    getDeviceInfo(): Promise<any>;
    getDeviceFeatures(): Promise<any[]>;
    getDeviceFeature(id: any): Promise<any>;
}