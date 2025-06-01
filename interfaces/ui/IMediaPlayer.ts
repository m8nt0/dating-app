// Audio/video Player interface

interface IMediaPlayer {
    play(url: string): Promise<void>;
    pause(): Promise<void>;
    stop(): Promise<void>;
}