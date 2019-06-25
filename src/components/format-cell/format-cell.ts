import { Prop, CustomElement } from '../../shared/decorators';
import { CustomElementClass } from '../../shared/element-class';
import { addClass, removeClass, toDash, generateHtmlEl } from '../../utils/functions';
import { dropDownShowClass } from '../../utils/global';
import { data, IMenu, IButton } from './data';
import { icons } from './icons';
import { HTMLTableBoxColorPickerElement } from '../color-picker/color-picker';

@CustomElement({
    selector: 'format-cell',
    template: ``,
    style: ``,
    useShadow: false
})
export class FormatCell extends CustomElementClass {
    @Prop('boolean')
    public initial!: boolean;
    public currentDropDown!: HTMLElement | null;

    constructor() {
        super();
        document.execCommand('defaultParagraphSeparator', false, 'p');
        document.execCommand('styleWithCSS', false, 'true');
    }

    public connectedCallback() {
        if (this.initial === false) return;
        this.initialize();
    }

    public initialize() {
        this.initial = false;

        for (const menu of data.menus) this.generateMenu(menu);
        for (const color of data.colors) this.generateColor(color);
        for (const button of data.buttons) this.generateButton(button);
    }

    public generateMenu(menu: IMenu): void {
        const currentMenu = generateHtmlEl(`<div class="format-dropdown" data-dropDown="${menu.command}" tabindex="1"></div>`);
        const currentMenuContent = generateHtmlEl(`<div class="format-dropdown__content"></div>`);
        const currentMenuBtn = generateHtmlEl(
            `<button class="format-dropbtn"><span>${menu.text}</span><i class="caret-down">${icons.caretDown}</i></button>`
        );
        currentMenuBtn.addEventListener('click', (event: Event) => this.toggleDropDown(event));

        currentMenu.appendChild(currentMenuBtn);
        currentMenu.appendChild(currentMenuContent);

        for (const item of menu.values) {
            const currentItem = generateHtmlEl(`<button class="content__item">${item.text}</button>`);
            currentItem.addEventListener('click', () => this.formatCustomDoc(menu.command, item));
            currentMenuContent.appendChild(currentItem);
        }

        this.addChild(currentMenu);
    }

    public generateColor(color: IButton): void {
        const currentColor = generateHtmlEl(
            `<div class="format-dropdown ${color.class || ''}" data-dropDown="${color.command}" tabindex="1"></div>`
        );
        const currentColorContent = generateHtmlEl(`<div class="format-dropdown__content"></div>`);

        const currentColorBtn = generateHtmlEl(
            `<button class="format-dropbtn button-icon">${icons.fontColor}<span class="color-view"></span></button>`
        );
        currentColorBtn.addEventListener('click', (event: Event) => this.toggleDropDown(event));

        const colorPicker = new HTMLTableBoxColorPickerElement();
        colorPicker.initial = true;
        colorPicker.onChange.on('selectedColor', (event: any) => this.formatCustomDoc(color.value, { text: null, value: event.rgb.rgba }));
        currentColorContent.appendChild(colorPicker);

        currentColor.appendChild(currentColorBtn);
        currentColor.appendChild(currentColorContent);

        this.addChild(currentColor);
    }

    public generateButton(button: IButton) {
        const currentBtnIcon = icons[button.icon];
        const currentBtn = generateHtmlEl(`<button class="button-icon ${button.class || ''}" tabindex="1"></button>`);
        currentBtn.addEventListener('click', () =>
            button.custom ? this.formatCustomDoc(button.command, button) : this.formatDoc(button.command, button)
        );
        currentBtn.innerHTML = currentBtnIcon;

        this.addChild(currentBtn);
    }

    public getCurrentDropDown(event: Event) {
        return (event.target as HTMLElement).closest('[data-dropDown]') as HTMLElement;
    }

    public toggleDropDown(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const currentDropDown = this.currentDropDown;
        const dropDown = this.getCurrentDropDown(event);

        if (currentDropDown && dropDown) this.hideDropDown();
        if (dropDown && currentDropDown !== dropDown) this.showDropDown(dropDown);
    }

    public showDropDown(dropDown: HTMLElement) {
        if (this.currentDropDown) removeClass(this.currentDropDown, dropDownShowClass);

        addClass(dropDown, dropDownShowClass);
        this.currentDropDown = dropDown;
        this.currentDropDown.focus();

        const self = this;
        document.addEventListener('click', onClick, false);
        function onClick(event: MouseEvent) {
            const target = event.target as HTMLElement;
            const parent = target.closest('.format-dropdown');

            if (!parent) {
                self.hideDropDown();
                document.removeEventListener('click', onClick, false);
            }
        }
    }

    public hideDropDown() {
        if (!this.currentDropDown) return;

        removeClass(this.currentDropDown, dropDownShowClass);
        this.currentDropDown.blur();
        this.currentDropDown = null;
    }

    public dropDownIsShown() {
        return this.currentDropDown ? this.currentDropDown.classList.contains(dropDownShowClass) : false;
    }

    public formatDoc(command: string, { text = null, value }: any) {
        const fullText = this.parentNode.innerText.trim();
        const selectedText = this.selectedText!.toString().trim();
        // if (text && this.currentDropDown) (this.currentDropDown.querySelector('button > span') as HTMLElement).innerText = text;

        if (fullText.length && selectedText.length) document.execCommand(command, false, value);
        this.focusCellContent();
    }

    public formatCustomDoc(key: any, { text = null, value }: any) {
        const fullText = this.parentNode.innerText.trim();
        const selectedText = this.selectedText!.toString().trim();
        const tagLocalName = this.parentNode.localName;
        if (!fullText.length || !selectedText.length) return this.focusCellContent();

        if (tagLocalName === 'span' && fullText.length === selectedText.length) {
            const currentValue = this.parentNode.style[key];
            const isUpdateListStyle = key === 'listStyle' && currentValue && currentValue !== value;

            if (['fontWeight', 'fontStyle', 'textDecoration', 'listStyle'].includes(key) && currentValue && !isUpdateListStyle) {
                this.parentNode.style.removeProperty(toDash(key));
                if (key === 'listStyle') {
                    this.parentNode.style.removeProperty('display');
                    this.parentNode.style.removeProperty('margin-left');
                }
                return;
            } else {
                this.parentNode.style.cssText += `${toDash(key)}:${value}`;
                if (key === 'listStyle')
                    this.parentNode.style.cssText += `display:list-item;margin-left:${this.parentNode.style.marginLeft || '30px'}`;
            }
        } else {
            const el: HTMLSpanElement = document.createElement('span');
            el.style[key] = value;
            if (key === 'listStyle') el.style.cssText += `display:list-item;margin-left:30px`;

            el.innerText = selectedText;

            let paragraph: HTMLParagraphElement | undefined;
            if (tagLocalName !== 'span' && tagLocalName !== 'p') {
                paragraph = document.createElement('p');
                paragraph.appendChild(el);
            }
            document.execCommand('insertHTML', false, paragraph ? paragraph!.outerHTML : el.outerHTML);

            // Update Selection
            const lastChild = this.parentNode.lastChild as HTMLElement;
            this.selectedText!.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(lastChild);
            this.selectedText!.addRange(range);
        }

        this.focusCellContent();
    }

    public focusCellContent() {
        if (this.currentDropDown && !this.currentDropDown.classList.contains('format-color')) this.hideDropDown();

        if (!this.currentDropDown)
            setTimeout(() => {
                if (this.parentCellContent) this.parentCellContent.focus();
            }, 300);
    }

    get parentCellContent(): HTMLTableCellElement {
        return this.parentNode.closest('cell-content') as HTMLTableCellElement;
    }

    get parentNode(): HTMLElement {
        const focusNode = (this.selectedText!.focusNode || document.activeElement) as HTMLElement;

        return focusNode.parentNode as HTMLElement;
    }

    get selectedText(): Selection | null {
        return window.getSelection();
    }
}
