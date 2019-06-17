import { CustomElementClass } from '../../shared/element-class';
import { CustomElement } from '../../shared/decorators';

@CustomElement({
    selector: 'cell-content',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLTableBoxCellContentElement extends CustomElementClass {}
