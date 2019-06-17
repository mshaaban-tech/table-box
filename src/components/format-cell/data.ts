import { buttonIconSeparate, buttonIconRotate } from '../../utils/global';

export interface IItem {
    value: string;
    text: string;
}

export interface IMenu {
    text: string;
    command: string;
    custom?: boolean;
    values: IItem[];
    class?: string;
}

export interface IButton extends IItem {
    command: string;
    custom?: boolean;
    class?: string;
    icon: string;
}

export interface IData {
    menus: IMenu[];
    colors: IButton[];
    buttons: IButton[];
}

export const data: IData = {
    menus: [
        {
            text: 'Font Name',
            command: 'fontFamily',
            values: [
                { value: 'arial', text: 'Arial' },
                { value: 'arial black', text: 'Arial Black' },
                { value: 'courier new', text: 'Courier New' },
                { value: 'times new roman', text: 'Times New Roman' }
            ]
        },
        {
            text: 'Font Size',
            command: 'fontSize',
            custom: true,
            values: [
                { value: '8px', text: '8px' },
                { value: '10px', text: '10px' },
                { value: '12px', text: '12px' },
                { value: '14px', text: '14px' },
                { value: '18px', text: '18px' },
                { value: '24px', text: '24px' },
                { value: '32px', text: '32px' }
            ]
        }
        // {
        //     text: 'Font Color',
        //     command: 'forecolor',
        //     values: [
        //         { value: 'red', text: 'Red' },
        //         { value: 'blue', text: 'Blue' },
        //         { value: 'green', text: 'Green' },
        //         { value: 'white', text: 'White' },
        //         { value: 'black', text: 'Black' }
        //     ]
        // },
        // {
        //     text: 'Font Back Color',
        //     command: 'backcolor',
        //     values: [
        //         { value: 'red', text: 'Red' },
        //         { value: 'blue', text: 'Blue' },
        //         { value: 'green', text: 'Green' },
        //         { value: 'white', text: 'White' },
        //         { value: 'black', text: 'Black' }
        //     ]
        // }
    ],
    colors: [
        {
            text: 'Font Color',
            value: 'color',
            command: 'forecolor',
            icon: 'fontColor',
            class: 'format-color'
        },
        {
            text: 'Font Back Color',
            value: 'backgroundColor',
            command: 'backcolor',
            icon: 'fontColor',
            class: 'format-color'
        }
    ],
    buttons: [
        {
            text: 'Bold',
            value: 'bolder',
            command: 'fontWeight',
            custom: true,
            icon: 'fontBold'
        },
        {
            text: 'Italic',
            value: 'italic',
            command: 'fontStyle',
            custom: true,
            icon: 'fontItalc'
        },
        {
            text: 'Underline',
            value: 'underline',
            command: 'textDecoration',
            custom: true,
            icon: 'fontUnderline',
            class: buttonIconSeparate
        },
        {
            text: 'Left align',
            value: 'textAlign',
            command: 'justifyleft',
            icon: 'fontAlignLeft'
        },
        {
            text: 'Center align',
            value: 'textAlign',
            command: 'justifycenter',
            icon: 'fontAlignCenter'
        },
        {
            text: 'Right align',
            value: 'textAlign',
            command: 'justifyright',
            icon: 'fontAlignRight',
            class: buttonIconSeparate
        },
        {
            text: 'Numbered list',
            value: 'decimal',
            command: 'listStyle',
            custom: true,
            icon: 'orderedList'
        },
        {
            text: 'Dotted list',
            value: 'disc',
            command: 'listStyle',
            custom: true,
            icon: 'unorderedList'
        },
        {
            text: 'Add indentation',
            value: 'textIndent',
            command: 'indent',
            icon: 'textIndent'
        },
        {
            text: 'Out indentation',
            value: 'textIndent',
            command: 'outdent',
            icon: 'textIndent',
            class: buttonIconRotate
        }
    ]
};
