// Camera and photo capture interface

interface ICamera {
    capturePhoto(): Promise<any>;
    captureVideo(): Promise<any>;
    getPhotos(): Promise<any[]>;
}