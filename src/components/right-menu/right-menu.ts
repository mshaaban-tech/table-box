import { CustomElement, Prop, HostListener } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { toggleClass } from '../../utils/functions';
import { HTMLTableBoxElement } from '../table-box/table-box';
import { HTMLTableBoxCellElement } from '../table-cell/table-cell';

@CustomElement({
    selector: 'right-menu',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLRightMenu extends CustomElementClass {
    @Prop('boolean')
    public initial!: boolean;

    @Prop('boolean')
    public isShown!: boolean;

    public currentCell!: HTMLTableBoxCellElement | null;

    public connectedCallback() {
        if (this.initial === false) return;
        this.initial = false;
        this.isShown = false;

        const insertRowBefore = document.createElement('button');
        insertRowBefore.innerText = 'Add row before';
        insertRowBefore.onclick = () => this.tableEl.insertRow(this.currentCell!.rowStart);
        this.addChild(insertRowBefore);

        const insertRowAfter = document.createElement('button');
        insertRowAfter.innerText = 'Add row after';
        insertRowAfter.onclick = () => this.tableEl.insertRow(this.currentCell!.rowEnd);
        this.addChild(insertRowAfter);

        const insertColumnBefore = document.createElement('button');
        insertColumnBefore.innerText = 'Add column before';
        insertColumnBefore.onclick = () => this.tableEl.insertColumn(this.currentCell!.columnStart);
        this.addChild(insertColumnBefore);

        const insertColumnAfter = document.createElement('button');
        insertColumnAfter.innerText = 'Add column after';
        insertColumnAfter.onclick = () => this.tableEl.insertColumn(this.currentCell!.columnEnd);
        this.addChild(insertColumnAfter);

        const mergeCells = document.createElement('button');
        mergeCells.innerText = 'Merge selected cells';
        mergeCells.onclick = () => this.tableEl.mergeCells();
        this.addChild(mergeCells);
    }

    get tableEl(): HTMLTableBoxElement {
        return this.offsetParent!.querySelector('table-box') as HTMLTableBoxElement;
    }

    get tableElPosition(): ClientRect | DOMRect {
        return this.tableEl!.getBoundingClientRect();
    }

    public toggle(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isShown ? this.hide() : this.show();

        const { left, top } = this.tableElPosition;
        this.setAttribute('style', `top: ${event.pageY + 15 - top}px; left: ${event.pageX + 15 - left}px;`);

        const currentCell = (event.target as HTMLElement)!.closest('table-cell') as HTMLTableBoxCellElement;
        if (this.currentCell && this.currentCell !== currentCell) this.show();

        this.currentCell = this.isShown ? currentCell : null;
    }

    public show() {
        const self = this;
        self.isShown = true;
        toggleClass(this, 'menu--show', 'menu--hide');

        document.addEventListener('mousedown', onMouseDown, false);
        function onMouseDown(event: MouseEvent) {
            document.removeEventListener('click', onMouseDown, false);
            self.hide();
        }
    }

    public hide() {
        this.isShown = false;
        toggleClass(this, 'menu--hide', 'menu--show');
    }

    @HostListener('contextmenu')
    public onRightClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.hide();
    }
}
