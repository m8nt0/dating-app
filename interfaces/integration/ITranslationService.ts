// Langugae translation interface

interface ITranslationService {
    translate(text: string, targetLanguage: string): Promise<any>;
    getTranslations(): Promise<any[]>;
    getTranslation(id: any): Promise<any>;
}