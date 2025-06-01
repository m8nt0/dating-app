// Media file storage interface

interface IFileStorage {
    upload(file: File): Promise<string>;
    download(url: string): Promise<File>;
    delete(url: string): Promise<void>;
}
