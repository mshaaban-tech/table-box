export const Prop = (type: string = ''): any => (target: HTMLElement, key: any, descriptor: TypedPropertyDescriptor<any>) => {
    const getter = function(this: HTMLElement) {
        let value = this.getAttribute(key) as any;
        let typeArr = type.split(':');

        return type ? propTypes[typeArr[0]](value, typeArr[1]) : value;
    };

    const setter = function(this: HTMLElement, newVal: any) {
        this.setAttribute(key, newVal!.toString() || '');
    };

    descriptor = descriptor || {};
    descriptor.get = getter;
    descriptor.set = setter;

    return descriptor;
};

const propTypes: PropType = {
    number: (value: any, type: string = ''): number => +(value || 0),
    boolean: (value: any, type: string = ''): boolean => JSON.parse(value),
    array: (value: any, type: string = ''): Array<string | number | boolean | any> => {
        value = value.split(',');

        if (type === 'number') value = value.map((v: string) => propTypes.number(v));
        if (type === 'boolean') value = value.map((v: string) => propTypes.boolean(v));

        return value;
    }
};

interface PropType {
    [key: string]: Function;
}
