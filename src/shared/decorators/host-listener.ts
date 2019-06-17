import { EventListenerDeclaration } from '.';

export const HostListener = (eventName: string, target: string | EventTarget | undefined = '') => (prototype: any, methodName: string) => {
    const constructor = prototype.constructor;
    if (!constructor.hasOwnProperty('__listeners')) Object.defineProperty(constructor, '__listeners', { value: [] });

    const listeners: EventListenerDeclaration[] = constructor.__listeners;
    listeners.push({
        eventName,
        target,
        handler: prototype[methodName]
    });
};
