// Machine learning inference interface

interface IMLEngine {
    predict(data: any): Promise<any>;
    train(data: any): Promise<any>;
    evaluate(data: any): Promise<any>;
}