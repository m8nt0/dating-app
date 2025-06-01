// Audio streaming interface

interface IAudioStreaming {
    stream(audio: any): Promise<void>;
    analyze(audio: any): Promise<void>;
    visualize(audio: any): Promise<void>;
}