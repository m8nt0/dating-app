// TIme-series data interface

interface ITimeSeries {
    append(data: any): Promise<void>;
    get(id: string): Promise<any>;
    delete(id: string): Promise<void>;
}