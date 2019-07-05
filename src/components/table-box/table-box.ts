import 'core-js/stable';
import 'regenerator-runtime/runtime';

/**
 * Import all custom elements
 */
import '../table-cell/table-cell';
import '../cell-content/cell-content';
import '../resize-row/resize-row';
import '../resize-column/resize-column';
import '../format-cell/format-cell';
import '../format-toolbar/format-toolbar';
import '../color-picker/color-picker';
import '../right-menu/right-menu';

import { CustomElement, Prop, HostListener } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { HTMLTableBoxCellElement } from '../table-cell/table-cell';
import { HTMLFormatToolbar } from '../format-toolbar/format-toolbar';
import { HTMLRightMenu } from '../right-menu/right-menu';
import { removeClass, range, addClass } from '../../utils/functions';
import { TableCellPosition, Dict } from '../../utils/model';
import { columnMinWidth, rowMinHeight, activeCellClass, selectedCellClass } from '../../utils/global';

@CustomElement({
    selector: 'table-box',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLTableBoxElement extends CustomElementClass {
    /**
     * Get active cell
     */
    get activeCell(): HTMLTableBoxCellElement {
        return this.querySelector(`table-cell.${activeCellClass}`) as HTMLTableBoxCellElement;
    }
    @Prop('boolean')
    public initial!: boolean;

    @Prop('number')
    public rows!: number;

    @Prop('number')
    public columns!: number;

    @Prop('array:number')
    public rowsStyle: number[] = [];

    @Prop('array:number')
    public columnsStyle: number[] = [];

    public formatToolbar!: HTMLFormatToolbar;

    public rightMenu!: HTMLRightMenu;

    public selectedCells: HTMLTableBoxCellElement[] = [];
    public uniqueSelectors: string[] = [];

    private isFocus!: boolean;

    public connectedCallback() {
        this.initial = this.initial === false ? this.initial : true;
        this.rows = this.rows || 1;
        this.columns = this.columns || 1;

        if (!this.initial) return;
        this.generateTable(this.rows, this.columns);
    }

    public componentDidMount() {
        this.formatToolbar = this.parentElement!.querySelector('format-toolbar') as HTMLFormatToolbar;
        this.rightMenu = this.parentElement!.querySelector('right-menu') as HTMLRightMenu;
        this.activeFirstCell();
    }

    public generateTable(rows: number, columns: number) {
        this.initial = false;
        this.tabIndex = 1;
        this.rows = rows;
        this.columns = columns;

        const rowsStyle: number[] = [];
        const columnsStyle: number[] = [];

        for (let row = 1; row <= rows; ++row) {
            rowsStyle.push(rowMinHeight);

            for (let column = 1; column <= columns; ++column) {
                const cellPosition: TableCellPosition = {
                    rowStart: row,
                    rowEnd: row + 1,
                    columnStart: column,
                    columnEnd: column + 1
                };

                const currentCell = this.generateCell(cellPosition);
                this.addChild(currentCell);
                if (row === 1) columnsStyle.push(columnMinWidth);
            }
        }

        this.rowsStyle = rowsStyle;
        this.columnsStyle = columnsStyle;

        this.setStyle();
    }

    public insertRow(rowStart: number) {
        const startCell = this.querySelector(`[rowstart^="${rowStart}"]`) as HTMLTableBoxCellElement;
        if (startCell) this.updateCellsRowPosition(startCell, rowStart);

        for (let column = 1; column <= this.columns; ++column) {
            const cellPosition: TableCellPosition = {
                rowStart,
                rowEnd: rowStart + 1,
                columnStart: column,
                columnEnd: column + 1
            };

            const currentCell = this.generateCell(cellPosition);
            if (startCell) {
                this.insertBefore(currentCell, startCell);
            } else {
                this.addChild(currentCell);
            }
        }

        const rowsStyle = this.rowsStyle;
        rowsStyle.splice(rowStart - 1, 0, rowMinHeight);
        this.rowsStyle = rowsStyle;
        ++this.rows;
        this.setStyle();
    }

    public updateCellsRowPosition(targetCell: HTMLTableBoxCellElement, rowStart: number) {
        if (targetCell.rowStart >= rowStart) {
            targetCell.setPosition({ rowStart: targetCell.rowStart + 1, rowEnd: targetCell.rowEnd + 1 });
        }

        const nextSibling = targetCell.nextSibling as HTMLTableBoxCellElement;
        if (nextSibling) this.updateCellsRowPosition(nextSibling, rowStart);
    }

    public insertColumn(columnStart: number) {
        const startCell = this.querySelector(`[columnstart^="${columnStart}"]`) as HTMLTableBoxCellElement;
        if (startCell) this.updateCellsColumnPosition(startCell, columnStart);

        for (let row = 1; row <= this.rows; ++row) {
            const cellPosition: TableCellPosition = {
                rowStart: row,
                rowEnd: row + 1,
                columnStart,
                columnEnd: columnStart + 1
            };

            const currentCell = this.generateCell(cellPosition);
            if (startCell) {
                this.insertBefore(currentCell, startCell);
            } else {
                this.addChild(currentCell);
            }
        }

        const columnsStyle = this.columnsStyle;
        columnsStyle.splice(columnStart - 1, 0, columnMinWidth);
        this.columnsStyle = columnsStyle;
        ++this.columns;
        this.setStyle();
    }

    public updateCellsColumnPosition(targetCell: HTMLTableBoxCellElement, columnStart: number) {
        if (targetCell.columnStart >= columnStart) {
            targetCell.setPosition({ columnStart: targetCell.columnStart + 1, columnEnd: targetCell.columnEnd + 1 });
        }

        const nextSibling = targetCell.nextSibling as HTMLTableBoxCellElement;
        if (nextSibling) this.updateCellsColumnPosition(nextSibling, columnStart);
    }

    public generateCell(cellPosition: TableCellPosition) {
        const cell = new HTMLTableBoxCellElement();
        cell.initialize(cellPosition);

        return cell;
    }

    public setStyle(): void {
        const rowsCss = this.rowsStyle.map(row => (row !== rowMinHeight ? `${row}px ` : `minmax(${row}px, auto) `)).join('');
        const columnsCss = this.columnsStyle
            .map(column => (column !== rowMinHeight ? `${column}px ` : `minmax(${column}px, 1fr) `))
            .join('');

        this.setAttribute('style', `grid-template-rows: ${rowsCss}; grid-template-columns: ${columnsCss};`);
        this.updateTabIndex();
    }

    public updateTabIndex(cell: HTMLTableBoxCellElement | null = null) {
        for (let i = 0; i < this.children.length; ++i) {
            (this.children[i] as HTMLTableBoxCellElement).tabIndex = i + 1;
        }
    }

    public unActiveAllCells() {
        const activeCells = this.querySelectorAll(`table-cell.${activeCellClass}`);

        for (let i = 0; i < activeCells.length; ++i) this.unActiveCell(activeCells[i] as HTMLElement);
    }

    public unSelectAllCells(currentCell: HTMLTableBoxCellElement | null = null) {
        for (let i = 0; i < this.children.length; ++i) this.unSelectCell(this.children[i] as HTMLElement);
        if (currentCell) currentCell.cellContent.focus();
        this.selectedCells = [];
        this.uniqueSelectors = [];
    }

    public unActiveCell(cell: HTMLElement) {
        removeClass(cell, activeCellClass);
    }

    public unSelectCell(cell: HTMLElement) {
        removeClass(cell, selectedCellClass);
    }

    public activeFirstCell() {
        if (this.children.length) (this.children[0] as HTMLElement).focus();
    }

    public mergeCells() {
        if (!this.selectedCells.length) return;

        const cellPosition = this.uniqueSelectors.reduce(
            (prev, curr: any, index: number) => {
                curr = curr.split(',').map((v: string) => +v);

                const newValue = {
                    rowStart: prev.rowStart ? Math.min(prev.rowStart, curr[0]) : curr[0],
                    rowEnd: Math.max(prev.rowEnd, curr[0]),
                    columnStart: prev.columnStart ? Math.min(prev.columnStart, curr[1]) : curr[1],
                    columnEnd: Math.max(prev.columnEnd, curr[1])
                };

                if (index === this.uniqueSelectors!.length - 1) {
                    ++newValue.rowEnd;
                    ++newValue.columnEnd;
                }
                return newValue;
            },
            {
                rowStart: 0,
                rowEnd: 0,
                columnStart: 0,
                columnEnd: 0
            }
        );

        const currentCell = this.generateCell(cellPosition);
        this.addChild(currentCell);
        for (const cell of this.selectedCells) {
            if (cell.cellContent.innerText) {
                const paragraph = document.createElement('p');
                paragraph.innerText = cell.cellContent.innerText;
                paragraph.style.cssText = cell.cellContent.style.cssText;
                currentCell.cellContent.addChild(paragraph);
            }
            for (let i = 0; i < cell.cellContent.children.length; ++i) {
                const child = cell.cellContent.children[i] as HTMLElement;
                currentCell.cellContent.addChild(child);
            }

            cell.remove();
        }
        currentCell.onFocusIn();
    }

    /**
     * Get cell by using column & row number
     * @param row row number
     * @param column column number
     */
    public getCellByPosition(row: string, column: string): HTMLTableBoxCellElement {
        return this.querySelector(`table-cell[${row}][${column}]:not(.${activeCellClass})`) as HTMLTableBoxCellElement;
    }

    @HostListener('contextmenu')
    public onRightClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        const currentCell = (event.target as HTMLElement).closest('table-cell') as HTMLTableBoxCellElement;
        if (!currentCell) return;
        if (!this.selectedCells.some(cell => cell.id === currentCell.id)) {
            this.unActiveAllCells();
            this.unSelectAllCells(currentCell);
        }

        this.rightMenu.toggle(event);
    }

    @HostListener('focusin')
    public onFocusIn(event: FocusEvent) {
        if (this.isFocus) return;
        this.isFocus = true;

        const self = this;
        this.formatToolbar!.show();

        document.addEventListener('click', onFocusOut, false);
        function onFocusOut(event: MouseEvent) {
            const isFocusOut = self.onFocusOut(event);

            if (isFocusOut) {
                self.isFocus = false;
                self.unActiveAllCells();
                self.unSelectAllCells();
                self.formatToolbar!.hide();
                document.removeEventListener('click', onFocusOut, false);
            }
        }
    }

    // @HostListener('focusout')
    public onFocusOut(event: FocusEvent | MouseEvent) {
        const target = (event.relatedTarget || event.target) as HTMLElement;
        const isTableBox = target!.closest('table-box');
        const isFormatToolbar = target!.closest('format-toolbar');

        return !isFormatToolbar && !isTableBox;
    }

    /**
     * Moving between cells by using arrow keys
     */
    @HostListener('keydown')
    public onKeyDown(event: KeyboardEvent) {
        const activeCell = (event.target as HTMLElement).closest('table-cell') as HTMLTableBoxCellElement;
        const keyCode: string = event.key;
        const keyCodes: string[] = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (!activeCell || !keyCodes.includes(keyCode)) return;

        // const activeCell = this.activeCell;
        let targetCell!: HTMLTableBoxCellElement;
        let column;
        let row;

        switch (keyCode) {
            case 'ArrowUp':
                column = activeCell.columnStart;
                row = activeCell.rowStart;

                if (row > 1) targetCell = this.getCellByPosition(`rowend="${row}"`, `columnstart="${column}"`);
                break;
            case 'ArrowDown':
                column = activeCell.columnStart;
                row = activeCell.rowEnd;

                if (row < this.rows + 1) targetCell = this.getCellByPosition(`rowstart="${row}"`, `columnstart="${column}"`);
                break;
            case 'ArrowLeft':
                column = activeCell.columnStart;
                row = activeCell.rowStart;
                if (column < 2) {
                    column = this.columns + 1;
                    --row;
                }

                if (row > 0) targetCell = this.getCellByPosition(`rowstart="${row}"`, `columnend="${column}"`);
                break;
            case 'ArrowRight':
                column = activeCell.columnEnd;
                row = activeCell.rowEnd;
                if (column > this.columns) {
                    column = 1;
                    ++row;
                }

                if (row < this.rows + 2) targetCell = this.getCellByPosition(`rowend="${row}"`, `columnstart="${column}"`);
                break;
            case 'Tab':
                this.unActiveAllCells();
                this.unSelectAllCells();
                break;
            default:
                break;
        }

        if (targetCell && activeCell !== targetCell) {
            this.unActiveCell(activeCell);
            this.unSelectAllCells();
            targetCell.cellContent.focus();
        }
    }

    @HostListener('mousedown')
    public onMouseDown(evt: MouseEvent) {
        // Return if mouse right click
        if (evt.which == 3) return;

        const startCell = (evt.target as HTMLElement).closest('table-cell') as HTMLTableBoxCellElement;
        const currentElementTagName = (evt.target as HTMLElement).tagName.toLowerCase();
        const isResizeElement = ['resize-row', 'resize-column'].includes(currentElementTagName);
        if (!startCell || isResizeElement) return;

        const self = this;
        let firstRow: number;
        let lastRow: number;
        let firstColumn: number;
        let lastColumn: number;

        startCell.ondragstart = () => false;
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        self.selectedCells = [startCell];

        function onMouseMove(event: MouseEvent) {
            const currentCell = (document.elementFromPoint(event.pageX, event.pageY) as HTMLElement).closest('table-cell') as HTMLTableBoxCellElement;
            if (!currentCell) return;
            const selectors = [];

            firstRow = Math.min(currentCell.rowStart, startCell.rowStart);
            lastRow = Math.max(currentCell.rowEnd, startCell.rowEnd) - 1;
            firstColumn = Math.min(currentCell.columnStart, startCell.columnStart);
            lastColumn = Math.max(currentCell.columnEnd, startCell.columnEnd) - 1;

            const selectedRows = range(firstRow, lastRow, 1);
            const selectedColumns = range(firstColumn, lastColumn, 1);

            for (const row of selectedRows) {
                for (const column of selectedColumns) selectors.push(`${row},${column}`);
            }
            self.uniqueSelectors = Array.from(new Set(selectors));
            if (self.uniqueSelectors.length > 1) {
                startCell.cellContent.blur();
                for (let i = 0; i < self.children.length; ++i) {
                    const cell = self.children[i] as HTMLTableBoxCellElement;
                    if (self.uniqueSelectors.includes(`${cell.rowStart},${cell.columnStart}`)) {
                        addClass(cell, selectedCellClass);
                        const isSelected = self.selectedCells.some(selectedCell => selectedCell.id === cell.id);
                        if (!isSelected) self.selectedCells.push(cell);
                    } else {
                        removeClass(cell, selectedCellClass);
                        const isSelected = self.selectedCells.some(selectedCell => selectedCell.id === cell.id);
                        if (!isSelected) self.selectedCells.push(cell);
                        for (let i = 0; i < self.selectedCells.length; ++i) {
                            if (self.selectedCells[i].id === cell.id) self.selectedCells.splice(i, 1);
                        }
                    }
                }
            } else {
                self.unSelectAllCells(startCell);
            }
        }

        function onMouseUp(event: MouseEvent) {
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);

            if (self.selectedCells.length === 1) {
                self.unActiveAllCells();
                self.unSelectAllCells(startCell);
            } else {
                const selectedCellsGrouped = self.selectedCells
                    .sort((a: HTMLTableBoxCellElement, b: HTMLTableBoxCellElement) => a.rowStart - b.rowStart)
                    .reduce((prev: Dict | any, curr: HTMLTableBoxCellElement) => {
                        if (!prev[curr.rowStart]) prev[curr.rowStart] = [];
                        prev[curr.rowStart].push(curr);

                        return prev;
                    }, {});

                self.selectedCells = [];
                for (const key of Object.keys(selectedCellsGrouped)) {
                    const currentGroupSorted = selectedCellsGrouped[key].sort(
                        (a: HTMLTableBoxCellElement, b: HTMLTableBoxCellElement) => a.columnStart - b.columnStart
                    );

                    for (const cell of currentGroupSorted) self.selectedCells.push(cell);
                }
            }
        }
    }
}
