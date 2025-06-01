// Real-time processing interface

// Real-time processing engine that extends the stream processing interface becuase it depends on it, I think?

interface IRealtimeEngine extends IStreamProcessor{
    insight(data: any): Promise<void>;
    action(data: any): Promise<void>;
    alert(data: any): Promise<void>;
    notify(data: any): Promise<void>;
}
