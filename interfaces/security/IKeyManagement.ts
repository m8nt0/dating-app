// Cryptographic key management

interface IKeyManagement {
    generateKeyPair(): Promise<any>;
    deriveKey(key: any): Promise<any>;
    encrypt(data: any): Promise<any>;
    decrypt(data: any): Promise<any>;
}
