import { CustomElementConfig } from '.';

const validateSelector = (selector: string) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name!');
    }
};

const customElementsDefine = window.customElements.define;
window.customElements.define = (name, cl, conf) => {
    const hot = (module as any)!.hot;

    if (!customElements.get(name)) return customElementsDefine.call(window.customElements, name, cl, conf);
    if (hot) window.location.reload();

    console.warn(`${name} has been defined twice`);
};

/**
 *
 * @param config custom element configuration
 *
 * @description Lifecycle Hooks
 * componentWillMount
 * connectedCallback
 * componentDidMount
 * componentWillUnmount
 * disconnectedCallback
 * componentDidUnmount
 *
 */
export const CustomElement = (config: CustomElementConfig) => (cls: any) => {
    validateSelector(config.selector);
    // if (!config.template) throw new Error('You need to pass a template for the element');

    const template = document.createElement('template');
    if (config.style) config.template = `<style>${config.style}</style> ${config.template}`;
    template.innerHTML = config.template;

    const connectedCallback = cls.prototype.connectedCallback || function() {};
    const disconnectedCallback = cls.prototype.disconnectedCallback || function() {};

    cls.prototype.initElement = function(content: DocumentFragment): void {
        this.tabIndex = this.tabIndex || 1;
        this.useShadow
            ? this.attachShadow({
                  mode: 'open'
              }).appendChild(content)
            : this.appendChild(content);

        const listeners = this.constructor.__listeners;
        for (const listener of listeners) {
            if (listener.eventName && listener.handler) {
                const target = (listener.target || this) as HTMLElement;
                if (target && target.addEventListener) {
                    target.addEventListener(listener.eventName, (e: any) => {
                        listener.handler.call(this, e);
                    });
                }
            }
        }
    };

    /**
     * Lifecycle Hooks
     */
    cls.prototype.connectedCallback = function() {
        if (this.componentWillMount) this.componentWillMount();

        const clone: DocumentFragment = document.importNode(template.content, true);
        this.useShadow = config.useShadow;
        this.initElement(clone);
        connectedCallback.call(this);

        if (this.componentDidMount) this.componentDidMount();
    };

    cls.prototype.disconnectedCallback = function() {
        if (this.componentWillUnmount) this.componentWillUnmount();
        disconnectedCallback.call(this);
        if (this.componentDidUnmount) this.componentDidUnmount();
    };

    /**
     * Define custom element
     */
    window.customElements.define(config.selector, cls);
};
