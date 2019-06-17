import { CustomElement, Prop, HostListener } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { columnMinWidth } from '../../utils/global';
import { pauseEvent } from '../../utils/functions';
import { HTMLTableBoxElement } from '../table-box/table-box';
import { HTMLTableBoxCellElement } from '../table-cell/table-cell';

@CustomElement({
    selector: 'resize-column',
    template: ``,
    style: ``,
    useShadow: false
})
export class ResizeColumn extends CustomElementClass {
    get tableEl(): HTMLTableBoxElement {
        return this.closest('table-box') as HTMLTableBoxElement;
    }

    get cellEl(): HTMLTableBoxCellElement {
        return this.closest('table-cell') as HTMLTableBoxCellElement;
    }

    get currentWidth(): number {
        return this.cellEl.getBoundingClientRect().width;
    }

    set currentWidth(width: number) {
        const columnsStyle = this.tableEl.columnsStyle;
        columnsStyle[this.cellEl.columnIndex] = width;

        this.tableEl.columnsStyle = columnsStyle;
        this.tableEl.setStyle();
    }

    get resizeWidth(): number {
        const cellColumnsArray: number[] = this.tableEl.columnsStyle.slice(this.cellEl.columnStart - 1, this.cellEl.columnEnd - 1);
        let currentColumnWidth = cellColumnsArray.pop();
        if (currentColumnWidth === columnMinWidth) {
            let cellColumnsNOtModifiedLength: number = cellColumnsArray.filter(col => col === columnMinWidth).length + 1;
            let cellColumnsModifiedWidth: number = cellColumnsArray
                .filter(col => col !== columnMinWidth)
                .reduce((total, num) => total + num, 0);

            currentColumnWidth = (this.currentWidth - cellColumnsModifiedWidth) / cellColumnsNOtModifiedLength;
        }

        return currentColumnWidth || columnMinWidth;
    }

    get maxWidth(): number {
        return this.tableEl.getBoundingClientRect().width;
    }

    get totalWidth(): number {
        return this.tableEl.columnsStyle.reduce((total, num) => total + num, 0);
    }

    public canResize(width: number, newWidth: number) {
        return this.maxWidth >= this.currentWidth + width && this.maxWidth >= this.totalWidth + width && newWidth > columnMinWidth;
    }

    @HostListener('mousedown')
    public onMouseDown(evt: MouseEvent) {
        const self = this;
        let cellWidth = self.resizeWidth;
        let pos1: number = 0;
        let pos2: number = evt.pageX;

        self.ondragstart = () => false;
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        function onMouseMove(event: MouseEvent) {
            pauseEvent(event);
            setMousePosition(event);
            const newWidth = cellWidth + pos1;

            if (!self.canResize(pos1, newWidth)) return;

            self.currentWidth = newWidth;
            cellWidth = newWidth;
        }

        function onMouseUp(event: MouseEvent) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        function setMousePosition(event: MouseEvent) {
            pos1 = event.pageX - pos2;
            pos2 = event.pageX;
        }
    }
}
