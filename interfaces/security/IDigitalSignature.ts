// Digital sigining interface

interface IDigitalSignature {
    sign(data: any): Promise<any>;
    verify(data: any): Promise<any>;
}
