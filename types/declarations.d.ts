declare module '*.scss' {
    const content: { [className: string]: any };
    export = content;
}

declare module '*.json' {
    const content: { [className: string]: any };
    export = content;
}

declare namespace JSX {
    interface Element {}
    interface IntrinsicElements {
        [tagName: string]: Element | HTMLElement | HTMLButtonElement | SVGSVGElement | any;
    }
}
