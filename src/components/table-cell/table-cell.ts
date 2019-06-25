import { CustomElement, Prop, HostListener } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { TableCellPosition } from '../../utils/model';
import { addClass, removeClass, generateID } from '../../utils/functions';
import { activeCellClass } from '../../utils/global';
import { HTMLTableBoxCellContentElement } from '../cell-content/cell-content';
import { HTMLTableBoxElement } from 'components/table-box/table-box';

@CustomElement({
    selector: 'table-cell',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLTableBoxCellElement extends CustomElementClass {
    @Prop('number')
    public rowStart!: number;

    @Prop('number')
    public rowEnd!: number;

    @Prop('number')
    public columnStart!: number;

    @Prop('number')
    public columnEnd!: number;

    @Prop('number')
    public rowIndex!: number;

    @Prop('number')
    public columnIndex!: number;

    public isFocus!: boolean;

    public componentDidMount() {
        if (!this.id) this.id = generateID('cell');
    }

    get tableEl(): HTMLTableBoxElement {
        return this.closest('table-box') as HTMLTableBoxElement;
    }

    get cellContent(): HTMLTableBoxCellContentElement {
        return this.querySelector('cell-content') as HTMLTableBoxCellContentElement;
    }

    public initialize(cellPosition: TableCellPosition): void {
        this.innerHTML = `
            <resize-row></resize-row>
            <resize-column></resize-column>
            <cell-content contentEditable="true"><p></p></cell-content>
        `;

        this.setPosition(cellPosition);
    }

    public setPosition(cellPosition: TableCellPosition) {
        this.rowStart = cellPosition.rowStart || this.rowStart;
        this.rowEnd = cellPosition.rowEnd || this.rowEnd;
        this.columnStart = cellPosition.columnStart || this.columnStart;
        this.columnEnd = cellPosition.columnEnd || this.columnEnd;
        this.rowIndex = this.rowEnd - 2;
        this.columnIndex = this.columnEnd - 2;

        this.setStyle();
    }

    public setStyle() {
        this.setAttribute(
            'style',
            `grid-row-start: ${this.rowStart};
             grid-row-end: ${this.rowEnd};
             grid-column-start: ${this.columnStart};
             grid-column-end: ${this.columnEnd};
             animation-delay: ${this.rowStart * 100}ms`
        );
    }

    @HostListener('focusin')
    public onFocusIn($event: FocusEvent | null = null) {
        if (this.isFocus) return;

        const self = this;
        this.isFocus = true;
        this.focus();
        this.cellContent.focus();
        addClass(this, activeCellClass);

        document.addEventListener('click', onBlur, false);
        function onBlur(event: any) {
            const target = event.target as HTMLElement;
            const isCurrentCell = target.closest(`#${self.id}`) as HTMLElement;
            const formatToolbar = target.closest('format-toolbar') as HTMLElement;
            if (isCurrentCell || formatToolbar) return;

            self.isFocus = false;
            removeClass(self as HTMLElement, activeCellClass);
            document.removeEventListener('click', onBlur, false);
        }
    }
}
