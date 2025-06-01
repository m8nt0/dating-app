// Image/video processing interface

interface IImageProcessor {
    process(image: any): Promise<void>;
    analyze(image: any): Promise<void>;
    visualize(image: any): Promise<void>;
    detect(image: any): Promise<void>;
    classify(image: any): Promise<void>;
    segment(image: any): Promise<void>;
    extract(image: any): Promise<void>;
    transform(image: any): Promise<void>;
}