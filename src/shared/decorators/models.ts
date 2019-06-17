export interface CustomElementConfig {
    selector: string;
    template: string;
    style?: string;
    useShadow?: boolean;
}

export interface EventListenerDeclaration {
    eventName: string;
    target: string | EventTarget;
    handler: (event?: Event) => void;
}
