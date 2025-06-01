// Accessibility features interface

interface IAcessibility {
    getAccessibilityFeatures(): Promise<any[]>;
    getAccessibilityFeature(id: any): Promise<any>;
}
