// Animation and transitions interface

interface IAnimationEngine {
    animate(element: any, options: any): Promise<any>;
    getAnimations(): Promise<any[]>;
    getAnimation(id: any): Promise<any>;
}