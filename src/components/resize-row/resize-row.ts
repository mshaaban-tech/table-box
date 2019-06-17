import { CustomElement, Prop, HostListener } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { rowMinHeight } from '../../utils/global';
import { pauseEvent } from '../../utils/functions';
import { HTMLTableBoxElement } from '../table-box/table-box';
import { HTMLTableBoxCellElement } from '../table-cell/table-cell';

@CustomElement({
    selector: 'resize-row',
    template: ``,
    style: ``,
    useShadow: false
})
export class ResizeRow extends CustomElementClass {
    get tableEl(): HTMLTableBoxElement {
        return this.closest('table-box') as HTMLTableBoxElement;
    }

    get cellEl(): HTMLTableBoxCellElement {
        return this.closest('table-cell') as HTMLTableBoxCellElement;
    }

    get currentHeight(): number {
        return this.cellEl.getBoundingClientRect().height;
    }

    set currentHeight(height: number) {
        const rowsStyle = this.tableEl.rowsStyle;
        rowsStyle[this.cellEl.rowIndex] = height;

        this.tableEl.rowsStyle = rowsStyle;
        this.tableEl.setStyle();
    }

    get resizeHeight(): number {
        const cellRowsArray: number[] = this.tableEl.rowsStyle.slice(this.cellEl.rowStart - 1, this.cellEl.rowEnd - 1);
        let currentRowHeight = cellRowsArray.pop();
        if (currentRowHeight === rowMinHeight) {
            let cellRowsNOtModifiedLength: number = cellRowsArray.filter(col => col === rowMinHeight).length + 1;
            let cellRowsModifiedHeight: number = cellRowsArray.filter(col => col !== rowMinHeight).reduce((total, num) => total + num, 0);

            currentRowHeight = (this.currentHeight - cellRowsModifiedHeight) / cellRowsNOtModifiedLength;
        }

        return currentRowHeight || rowMinHeight;
    }

    get maxHeight(): number {
        return this.tableEl.getBoundingClientRect().height;
    }

    get totalHeight(): number {
        return this.tableEl.rowsStyle.reduce((total, num) => total + num, 0);
    }

    public canResize(height: number, newHeight: number) {
        return this.maxHeight >= this.currentHeight + height && this.maxHeight >= this.totalHeight + height && newHeight > rowMinHeight;
    }

    @HostListener('mousedown')
    public onMouseDown(evt: MouseEvent) {
        const self = this;
        let cellHeight: number = self.resizeHeight || rowMinHeight;
        let pos1: number = 0;
        let pos2: number = evt.pageY;

        self.ondragstart = () => false;
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        function onMouseMove(event: MouseEvent) {
            pauseEvent(event);
            setMousePosition(event);
            const newHeight = cellHeight + pos1;

            if (!self.canResize(pos1, newHeight)) return;

            self.currentHeight = newHeight;
            cellHeight = newHeight;
        }

        function onMouseUp(event: MouseEvent) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function setMousePosition(event: MouseEvent) {
            pos1 = event.pageY - pos2;
            pos2 = event.pageY;
        }
    }
}
