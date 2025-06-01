// Video calling interface

interface IVideoCall {
    call(call: any): Promise<void>;
    answer(call: any): Promise<void>;
    reject(call: any): Promise<void>;
    hangup(call: any): Promise<void>;
    mute(call: any): Promise<void>;
    unmute(call: any): Promise<void>;
    video(call: any): Promise<void>;
}