import { Prop, CustomElement } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { addClass, removeClass } from '../../utils/functions';

@CustomElement({
    selector: 'format-toolbar',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLFormatToolbar extends CustomElementClass {
    @Prop('boolean')
    public initial!: boolean;

    public connectedCallback() {
        if (this.initial === false) return;
        this.initial = false;

        this.insertAdjacentHTML('beforeend', '<format-cell initial="true" />');
    }

    public show() {
        removeClass(this, 'close-toolbar');
        addClass(this, 'open-toolbar');
    }

    public hide() {
        removeClass(this, 'open-toolbar');
        addClass(this, 'close-toolbar');
    }
}
