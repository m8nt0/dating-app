// Stream processing interface

interface IStreamProcessor {
    process(data: any): Promise<void>;
    stream(data: any): Promise<void>;
    analyze(data: any): Promise<void>;
}