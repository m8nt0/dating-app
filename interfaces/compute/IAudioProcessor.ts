// Audio processing interface

interface IAudioProcessor {
    process(audio: any): Promise<void>;
    analyze(audio: any): Promise<void>;
    visualize(audio: any): Promise<void>;
    detect(audio: any): Promise<void>;
    classify(audio: any): Promise<void>;
    segment(audio: any): Promise<void>;
    extract(audio: any): Promise<void>;
    transform(audio: any): Promise<void>;
}