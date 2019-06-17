import { EventListenerDeclaration } from './decorators';

export class CustomElementClass extends HTMLElement {
    public useShadow: boolean | undefined;

    get node(): HTMLElement {
        return (this as any) as HTMLElement;
    }

    static get __listeners(): EventListenerDeclaration[] {
        return [];
    }

    public addChild(el: HTMLElement): void {
        (this.shadowRoot || this)!.appendChild(el);
    }

    public getStyle(): string | null {
        return this.getAttribute('style');
    }

    public componentWillMount() {
        // console.log('table will mount');
    }

    public connectedCallback() {
        // console.log('table connected');
    }

    public componentDidMount() {
        // console.log('table did mount');
    }

    public componentWillUnmount() {
        // console.log('table will unmount');
    }

    public disconnectedCallback() {
        // console.log('table disconnected');
    }

    public componentDidUnmount() {
        // console.log('table did unmount');
    }
}
