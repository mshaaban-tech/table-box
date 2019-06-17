export interface TableCellPosition extends TableCellRow, TableCellColumn {}

export interface TableCellRow {
    rowStart?: number;
    rowEnd?: number;
}

export interface TableCellColumn {
    columnStart?: number;
    columnEnd?: number;
}

export interface Dict {
    [key: number]: any;
}
