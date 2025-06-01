// Data encryption/decryption interface

interface IEncryption {
    encrypt(data: any): Promise<any>;
    decrypt(data: any): Promise<any>;

    // Maybe in a different interface?
    hash(data: any): Promise<any>;
    verify(data: any): Promise<any>;
    sign(data: any): Promise<any>;
    verifySignature(data: any): Promise<any>;
    generateKeyPair(): Promise<any>;
    deriveKey(data: any): Promise<any>;
}
