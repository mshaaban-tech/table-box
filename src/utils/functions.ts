export const generateID = (title: string): string => {
    const id = `${title}-${Math.round(Math.random() * new Date().getTime())}`;

    return id;
};

export const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export const toDash = (str: string) =>
    str.replace(/([A-Z])/g, function($1: string) {
        return '-' + $1.toLowerCase();
    });

export const generateHtmlEl = (html: string): HTMLElement =>
    new DOMParser().parseFromString(html, 'text/html').body.childNodes[0] as HTMLElement;

export const addClass = (el: HTMLElement, classStr: string) => el.classList.add(classStr);

export const removeClass = (el: HTMLElement, classStr: string) => el.classList.remove(classStr);

export const toggleClass = (el: HTMLElement, add: string, remove: string) => {
    removeClass(el, remove);
    addClass(el, add);
};

export const sliceHtmlCollection = (colection: HTMLCollection | any): HTMLElement[] => {
    return [].slice.call(colection).map(item => item as HTMLElement);
};

export const pauseEvent = (e: Event | any) => {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();

    e.cancelBubble = true;
    e.returnValue = false;
    window.getSelection().removeAllRanges();
    return false;
};
