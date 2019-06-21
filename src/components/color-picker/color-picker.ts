import { EventEmitter } from 'events';
import { CustomElementClass } from '../../shared/element-class';
import { CustomElement, Prop } from '../../shared/decorators';
import { HEX, HSB, Color, hextoHSB, HcolortoHEX, opacityfromHSB, initSelectedColor, fillColor, Point, Rect } from './model';

@CustomElement({
    selector: 'color-picker',
    template: ``,
    style: ``,
    useShadow: false
})
export class HTMLTableBoxColorPickerElement extends CustomElementClass {
    @Prop('boolean')
    public initial!: boolean;

    @Prop() public color!: string;
    @Prop() public opacity!: string;
    @Prop() public backgroundColor!: string;
    @Prop() public left!: string;
    @Prop() public top!: string;

    // TODO Host Binder
    public onChange: EventEmitter = new EventEmitter();

    public currentHSB!: string;
    public currentOpacity!: string;
    public currentColorText!: string;

    public eventList!: string[];
    public selectedColor!: Color | any;
    public pickers!: any;
    public pickerName!: string[];
    public svgEl!: SVGSVGElement;
    public svgContainer!: HTMLElement;
    public mouseStart!: boolean;
    public textType!: string[];
    public curTextType!: string;
    public curColor!: string;
    public leftPos!: string;
    public topPos!: string;
    public backColor!: string;
    public ptStart!: Point;
    public ptMove!: Point;

    public connectedCallback() {
        if (this.initial === false) return (this.pickers = this.svgPickers());

        this.initial = false;
        this.init();
        this.renderPallet();
    }

    public svgPickers(): any {
        // define a subset of VNode including only the picker objects
        const svgEl: any = this.querySelector('#svg-container');
        const vn: any = {};
        // header picker with selected color and opacity
        // can be used to toggle the text color
        let pal: any = svgEl.querySelector('#pickerColor');
        vn.header1 = {
            palette: pal,
            rect: {
                x: parseFloat(pal.getAttribute('x')),
                y: parseFloat(pal.getAttribute('y')),
                width: parseFloat(pal.getAttribute('width')),
                height: parseFloat(pal.getAttribute('height'))
            }
        };
        // header picker with the hue component of the selected color
        // can be used to toggle the text color
        vn.header2 = { palette: svgEl.querySelector('#pickerColor1') };
        // header text of the selected color can be toogled
        vn.headertext = { palette: svgEl.querySelector('#pickerText') };
        // color container to select the saturation and brightness components of the color
        pal = svgEl.querySelector('#pickerContainer');
        vn.color = {
            palette: pal,
            rect: {
                x: parseFloat(pal.getAttribute('x')),
                y: parseFloat(pal.getAttribute('y')),
                width: parseFloat(pal.getAttribute('width')),
                height: parseFloat(pal.getAttribute('height'))
            },
            handler: svgEl.querySelector('#pickerHandler'),
            poshandler: {
                dx: 0,
                dy: 0
            }
        };
        vn.colorS = { palette: svgEl.querySelector('#pickerGradientS') };
        vn.colorB = { palette: svgEl.querySelector('#pickerGradientB') };
        // hue slider to select the hue color component
        pal = svgEl.querySelector('#pickerColorSlider');
        let hand: any = svgEl.querySelector('#pickerColSliderHandler');
        vn.hue = {
            palette: pal,
            rect: {
                x: parseFloat(pal.getAttribute('x')),
                y: parseFloat(pal.getAttribute('y')),
                width: parseFloat(pal.getAttribute('width')),
                height: parseFloat(pal.getAttribute('height'))
            },
            handler: hand,
            poshandler: {
                dx: (parseFloat(hand.getAttribute('width')) - parseFloat(pal.getAttribute('width'))) / 2,
                dy: parseFloat(hand.getAttribute('height')) / 2
            }
        };
        // opacity slider to select the desired color opacity
        pal = svgEl.querySelector('#pickerOpacitySlider');
        hand = svgEl.querySelector('#pickerOpaSliderHandler');
        vn.opacity = {
            palette: pal,
            rect: {
                x: parseFloat(pal.getAttribute('x')),
                y: parseFloat(pal.getAttribute('y')),
                width: parseFloat(pal.getAttribute('width')),
                height: parseFloat(pal.getAttribute('height'))
            },
            handler: hand,
            poshandler: {
                dx: (parseFloat(hand.getAttribute('width')) - parseFloat(pal.getAttribute('width'))) / 2,
                dy: parseFloat(hand.getAttribute('height')) / 2
            },
            gradient: svgEl.children[0].children[0].children[3]
        };

        return vn;
    }

    public async getHandlerCoordinates(pickers: any, type: string, hsb: HSB): Promise<Point | null> {
        //Define for a given HSB color the corresponding slider position
        const rect: Rect = pickers[type].rect;
        const opa: number = opacityfromHSB(hsb);
        let ret: Point | null = {} as Point;
        switch (type) {
            case 'color': {
                // saturation/brightness
                ret.x = (hsb.s / 100) * rect.width;
                ret.y = (1 - hsb.b / 100) * rect.height;
                break;
            }
            case 'hue': {
                // hue
                const dy = pickers['hue'].poshandler.dy;
                ret.x = 0;
                ret.y = (hsb.h / 360) * rect.height - dy;
                break;
            }
            case 'opacity': {
                // opacity
                const dy = pickers['opacity'].poshandler.dy;
                ret.x = 0;
                ret.y = opa * rect.height - dy;
                break;
            }
            default: {
                ret = null;
                break;
            }
        }

        return ret;
    }

    public getPickCoordinates(rect: any, pt: Point): Rect {
        // return the event coordinates transformed in the target object coordinate system
        const rect1: Rect = {} as Rect;
        rect1.x = pt.x - rect.x;
        rect1.y = pt.y - rect.y;
        rect1.width = rect.width;
        rect1.height = rect.height;
        return rect1;
    }

    public async setPickerHandler(pickers: any, type: string, pt: Point): Promise<void> {
        // Update in pickers the handler position
        if (type == 'color') {
            const cx: number = pickers[type].rect.x + pt.x - pickers[type].poshandler.dx;
            const cy: number = pickers[type].rect.y + pt.y;
            pickers[type].handler.setAttribute('cx', cx);
            pickers[type].handler.setAttribute('cy', cy);
        }
        if (type == 'hue' || type == 'opacity') {
            const x: number = pickers[type].rect.x + pt.x - pickers[type].poshandler.dx;
            const y: number = pickers[type].rect.y + pt.y;
            pickers[type].handler.setAttribute('x', x);
            pickers[type].handler.setAttribute('y', y);
        }
        return Promise.resolve();
    }

    public async updateStateProperties(h: number, s: number, b: number, opa: number): Promise<void> {
        // Update the State variables to generate a new rendering of the component
        const color: HSB = {} as HSB;
        color.s = s;
        color.b = b;
        color.h = h;
        color.hsb = 'HSB(' + color.h.toFixed(0) + ',' + color.s.toFixed(0) + '%,' + color.b.toFixed(0) + '%)';
        color.hsba = 'HSBA(' + color.h.toFixed(0) + ',' + color.s.toFixed(0) + '%,' + color.b.toFixed(0) + '%,' + opa.toFixed(3) + ')';
        this.selectedColor = fillColor(color);
        this.currentHSB = this.selectedColor.hsb.hsb;
        this.currentColorText = this.selectedColor[this.curTextType][this.curTextType + 'a'];
        this.currentOpacity = opa.toFixed(3);

        return Promise.resolve();
    }

    public setTextColor(hsb: HSB, t?: string): string {
        // define the color of the header text, the buttons text
        // and the slider handlers
        // as a function of the hsb selected color and the background color
        const type = t ? t : 'col';
        const opa: number = opacityfromHSB(hsb);
        if (type == 'col' && opa < 0.4) return '#000000';
        if (hsb.h < 300 && hsb.h > 195) {
            if (hsb.s < 60 && hsb.b > 50) return '#000000';
            return '#ffffff';
        }
        if (hsb.h < 195 && hsb.h > 40) {
            if (hsb.b < 50) return '#ffffff';
            return '#000000';
        }
        if (hsb.b < 50) return '#ffffff';
        if (hsb.s > 60) return '#ffffff';
        return '#000000';
    }

    public async updateSvgElements(hHex: HEX, textColor: string): Promise<void> {
        // Update the changing SVG Element (color and position)
        this.pickers = this.svgPickers();
        this.pickerName.forEach(async obj => {
            if (obj === 'header2' || obj === 'color') {
                this.pickers[obj].palette.setAttribute('fill', hHex.hex);
            }
            if (obj === 'header1') {
                this.pickers[obj].palette.setAttribute('fill', this.selectedColor.hex.hex);
                this.pickers[obj].palette.setAttribute('fill-opacity', this.currentOpacity);
            }
            if (obj === 'headertext') {
                this.pickers[obj].palette.setAttribute('fill', textColor);
                this.pickers[obj].palette.textContent = this.currentColorText;
            }
            if (obj === 'opacitygradient') {
                this.pickers.opacity.gradient.children[0].setAttribute('stop-color', this.selectedColor.hex.hex);
                this.pickers.opacity.gradient.children[1].setAttribute('stop-color', this.selectedColor.hex.hex);
            }
            if (obj === 'color' || obj === 'hue' || obj === 'opacity') {
                const pt: Point | null = await this.getHandlerCoordinates(this.pickers, obj, this.selectedColor.hsb);
                if (pt != null) await this.setPickerHandler(this.pickers, obj, pt);
            }
        });
    }

    public async pickHeader(): Promise<void> {
        // toggle the color text
        this.toggleTextType();
        return Promise.resolve();
    }

    public async calcH(y: number, height: number): Promise<number> {
        // return the vertical position for the hue slider handler
        if (y > height) return 360;
        if (y < 0) return 0;
        return (y / height) * 360;
    }

    public async calcS(x: number, width: number): Promise<number> {
        // return the horizontal position for the saturation slider handler
        if (x > width) return 100;
        if (x < 0) return 0;
        return (x / width) * 100;
    }

    public async calcB(y: number, height: number): Promise<number> {
        // return the vertical position for the brightness slider handler
        if (y > height) return 0;
        if (y < 0) return 100;
        return (1 - y / height) * 100;
    }

    public async calcO(y: number, height: number): Promise<number> {
        // return the vertical position for the opacity slider handler
        if (y > height) return 1;
        if (y < 0) return 0;
        return y / height;
    }

    // ---- Deal with init
    public init(): void {
        this.curColor = this.color ? this.color : '#ff0000';
        this.currentOpacity = this.opacity ? this.opacity : '1';
        this.backColor = this.backgroundColor ? this.backgroundColor : '#3e3f52';
        this.topPos = this.top ? this.top : '10';
        this.leftPos = this.left ? this.left : '10';
        this.selectedColor = initSelectedColor(this.curColor, this.currentOpacity);
        this.currentHSB = this.selectedColor.hsb.hsb;
        this.pickerName = ['header1', 'header2', 'headertext', 'color', 'hue', 'opacity', 'opacitygradient'];
        this.textType = ['hex', 'rgb', 'hsl', 'hsb'];
        this.currentColorText = this.selectedColor.hex.hexa;
        this.curTextType = 'hex';
        this.mouseStart = false;
    }

    // ---- Deal with onChange Event
    public onChangeHandler(): any {
        this.renderPallet();
        this.onChange.emit('selectedColor', this.selectedColor);
        return this.selectedColor;
    }

    // ---- Deal with UI Events ----
    public async handleEventTarget(ev: MouseEvent | TouchEvent | any, pt: Point) {
        // routes the event target to the corresponding picker
        if (
            ev.target == this.pickers.header1.palette ||
            ev.target == this.pickers.headertext.palette ||
            ev.target == this.pickers.header2.palette
        )
            await this.pickHeader();
        if (
            ev.target == this.pickers.color.palette ||
            ev.target == this.pickers.colorS.palette ||
            ev.target == this.pickers.colorB.palette ||
            ev.target == this.pickers.color.handler
        )
            await this.pickColor(pt);
        if (ev.target == this.pickers.hue.palette || ev.target == this.pickers.hue.handler) await this.pickHue(pt);
        if (ev.target == this.pickers.opacity.palette || ev.target == this.pickers.opacity.handler) await this.pickOpacity(pt);

        this.onChangeHandler();
    }

    public handleClick(ev: MouseEvent) {
        ev.preventDefault();
        const pt: Point = { x: ev.pageX, y: ev.pageY };
        this.handleEventTarget(ev, pt);
    }

    public handleMouseDown(ev: MouseEvent) {
        ev.preventDefault();
        this.mouseStart = true;
        const pt: Point = { x: ev.pageX, y: ev.pageY };
        this.handleEventTarget(ev, pt);
    }

    public handleMouseMove(ev: MouseEvent) {
        ev.preventDefault();
        if (this.mouseStart) {
            if (
                ev.target != this.pickers.header1.palette &&
                ev.target != this.pickers.headertext.palette &&
                ev.target != this.pickers.header2.palette
            ) {
                const pt: Point = { x: ev.pageX, y: ev.pageY };
                this.handleEventTarget(ev, pt);
            }
        }
    }

    public handleMouseEnd(ev: MouseEvent) {
        ev.preventDefault();
        if (this.mouseStart) this.mouseStart = false;
    }

    public handleTouchStart(ev: TouchEvent) {
        const pt: Point = { x: ev.touches[0].pageX, y: ev.touches[0].pageY };
        ev.preventDefault();
        this.handleEventTarget(ev, pt);
    }

    public handleTouchMove(ev: TouchEvent) {
        ev.preventDefault();
        const pt: Point = { x: ev.touches[0].pageX, y: ev.touches[0].pageY };
        this.handleEventTarget(ev, pt);
    }

    public handleTouchEnd(ev: TouchEvent) {
        ev.preventDefault();
    }

    // ---- Pickers Utilities ----

    public async pickColor(pt: Point): Promise<void> {
        // Calculate the Saturation and Brightness color component from the touch/mouse event
        const pickEl: any = this.pickers.color.palette.getBoundingClientRect();
        const pos: Rect = this.getPickCoordinates(pickEl, pt);
        return await this.updateStateProperties(
            this.selectedColor.hsb.h,
            await this.calcS(pos.x, pos.width),
            await this.calcB(pos.y, pos.height),
            opacityfromHSB(this.selectedColor.hsb)
        );
    }

    public async pickHue(pt: Point): Promise<void> {
        // Calculate the Hue color component from the touch/mouse event
        const pickEl: any = this.pickers.hue.palette.getBoundingClientRect();
        const pos: Rect = this.getPickCoordinates(pickEl, pt);
        return await this.updateStateProperties(
            await this.calcH(pos.y, pos.height),
            this.selectedColor.hsb.s,
            this.selectedColor.hsb.b,
            opacityfromHSB(this.selectedColor.hsb)
        );
    }

    public async pickOpacity(pt: Point): Promise<void> {
        // Calculate the opacity from the touch/mouse event
        const pickEl: any = this.pickers.opacity.palette.getBoundingClientRect();
        const pos: Rect = this.getPickCoordinates(pickEl, pt);
        return await this.updateStateProperties(
            this.selectedColor.hsb.h,
            this.selectedColor.hsb.s,
            this.selectedColor.hsb.b,
            await this.calcO(pos.y, pos.height)
        );
    }

    // ---- Text Utilities
    public toggleTextType(): void {
        // allow to toggle the Color Text in the Header with touchstart or mouse events
        // toggle HEX to RGB to HSL to HSB to HEX
        let idx: number = this.textType.indexOf(this.curTextType);
        idx++;
        if (idx > 3) idx = 0;
        this.curTextType = this.textType[idx];
        this.currentColorText = this.selectedColor[this.curTextType][this.curTextType + 'a'];
    }

    public renderPallet() {
        const textColor: string = this.setTextColor(this.selectedColor.hsb);
        const handleColor: string = this.setTextColor(hextoHSB(this.backColor), 'back');
        const divStyle: any = { righ: 0, width: '300px', height: '210px' };
        const hHEX: HEX = HcolortoHEX(this.selectedColor.hsb);

        if (!this.svgContainer) {
            this.svgContainer = document.createElement('div') as HTMLElement;
            this.svgContainer.id = 'svg-container';
            this.svgContainer.style.cssText = divStyle;
            this.svgContainer.onmousedown = this.handleMouseDown.bind(this);
            this.svgContainer.onmousemove = this.handleMouseMove.bind(this);
            this.svgContainer.onmouseup = this.handleMouseEnd.bind(this);
            this.svgContainer.ontouchstart = this.handleTouchStart.bind(this);
            this.svgContainer.ontouchmove = this.handleTouchMove.bind(this);
            this.svgContainer.ontouchend = this.handleTouchEnd.bind(this);
            this.svgContainer.onclick = this.handleClick.bind(this);

            const svgContent = `<svg width="300" height="210">
                        <defs>
                            <linearGradient id="pickerHue">
                                <stop offset="0" stop-color="#fff" stop-opacity="1" />
                                <stop offset="1" stop-color="#fff" stop-opacity="0" />
                            </linearGradient>
                            <linearGradient id="pickerBrightness" x2="0" y2="1">
                                <stop offset="0" stop-color="#000" stop-opacity="0" />
                                <stop offset="1" stop-color="#000" stop-opacity="1" />
                            </linearGradient>
                            <linearGradient id="colorSliderGradient" x2="0" y2="1">
                                <stop offset="0" stop-color="hsl(0,100%,50%" stop-opacity="1" />
                                <stop offset="0.06" stop-color="hsl(20,100%,50%" stop-opacity="1" />
                                <stop offset="0.11" stop-color="hsl(40,100%,50%" stop-opacity="1" />
                                <stop offset="0.17" stop-color="hsl(60,100%,50%" stop-opacity="1" />
                                <stop offset="0.22" stop-color="hsl(80,100%,50%" stop-opacity="1" />
                                <stop offset="0.28" stop-color="hsl(100,100%,50%" stop-opacity="1" />
                                <stop offset="0.33" stop-color="hsl(120,100%,50%" stop-opacity="1" />
                                <stop offset="0.39" stop-color="hsl(140,100%,50%" stop-opacity="1" />
                                <stop offset="0.44" stop-color="hsl(160,100%,50%" stop-opacity="1" />
                                <stop offset="0.50" stop-color="hsl(180,100%,50%" stop-opacity="1" />
                                <stop offset="0.56" stop-color="hsl(200,100%,50%" stop-opacity="1" />
                                <stop offset="0.61" stop-color="hsl(220,100%,50%" stop-opacity="1" />
                                <stop offset="0.67" stop-color="hsl(240,100%,50%" stop-opacity="1" />
                                <stop offset="0.72" stop-color="hsl(260,100%,50%" stop-opacity="1" />
                                <stop offset="0.78" stop-color="hsl(280,100%,50%" stop-opacity="1" />
                                <stop offset="0.83" stop-color="hsl(300,100%,50%" stop-opacity="1" />
                                <stop offset="0.89" stop-color="hsl(320,100%,50%" stop-opacity="1" />
                                <stop offset="0.94" stop-color="hsl(340,100%,50%" stop-opacity="1" />
                                <stop offset="1.00" stop-color="hsl(360,100%,50%" stop-opacity="1" />
                            </linearGradient>
                            <linearGradient id="opacitySliderGradient" x2="0" y2="1">
                                <stop offset="0" stop-color=${this.selectedColor.hex.hex} stop-opacity="0" />
                                <stop offset="1" stop-color=${this.selectedColor.hex.hex} stop-opacity="1" />
                            </linearGradient>
                            <pattern id="transparency" patternUnits="userSpaceOnUse" width="10" height="10">
                                <rect x="0" y="0" width="5" height="5" fill="#022460" fill-opacity="0.2" />
                                <rect x="5" y="0" width="5" height="5" fill="#dddddd" fill-opacity="0.2" />
                                <rect x="0" y="5" width="5" height="5" fill="#dddddd" fill-opacity="0.2" />
                                <rect x="5" y="5" width="5" height="5" fill="#022460" fill-opacity="0.2" />
                            </pattern>
                        </defs>
                        <rect id="pickerBackground" width="300" height="250" fill=${this.backColor} />
                        <rect class="pickerColorWhite" x="0" y="0" width="240" height="25" fill="#ffffff" />
                        <rect class="pickerTransparencyColor" x="0" y="0" width="240" height="25" fill="url(#transparency)" />
                        <rect id="pickerColor1" x="240" y="0" width="60" height="25" fill=${hHEX.hex} />
                        <rect
                            id="pickerColor"
                            x="0"
                            y="0"
                            width="240"
                            height="25"
                            fill=${this.selectedColor.hex.hex}
                            fill-opacity=${this.currentOpacity}
                        />
                        <text
                            id="pickerText"
                            text-anchor="middle"
                            x="120"
                            y="20"
                            font-family="Verdana"
                            font-size="13"
                            font-weight="bold"
                            fill=${textColor}
                        >
                            ${this.currentColorText}
                        </text>

                        <rect id="pickerContainer" x="16" y="35" width="180" height="150" fill=${hHEX.hex} />
                        <rect id="pickerGradientS" x="16" y="35" width="180" height="150" fill="url(#pickerHue)" rx="2" ry="2" />
                        <rect id="pickerGradientB" x="16" y="35" width="180" height="150" fill="url(#pickerBrightness)" rx="2" ry="2" />
                        <circle id="pickerHandler" r="4" cx="196" cy="35" fill="none" stroke="#fff" stroke-width="2" />

                        <rect class="pickerSliderWhite" width="34" height="150" x="206" y="35" fill="#ffffff" />
                        <rect class="pickerTransparencySlider" width="34" height="150" x="206" y="35" fill="url(#transparency)" />
                        <rect id="pickerOpacitySlider" width="34" height="150" x="206" y="35" fill="url(#opacitySliderGradient)" />
                        <rect id="pickerColorSlider" width="34" height="150" x="250" y="35" fill="url(#colorSliderGradient)" />
                        <rect
                            id="pickerOpaSliderHandler"
                            x="204"
                            y="182"
                            width="38"
                            height="6"
                            fill="none"
                            stroke=${handleColor}
                            stroke-width="2"
                        />
                        <rect
                            id="pickerColSliderHandler"
                            x="248"
                            y="182"
                            width="38"
                            height="6"
                            fill="none"
                            stroke=${handleColor}
                            stroke-width="2"
                        />
                    </svg>`;

            this.svgContainer.insertAdjacentHTML('beforeend', svgContent);
            this.addChild(this.svgContainer);
        } else {
            this.updateSvgElements(hHEX, textColor);
        }

        return this.svgContainer;
    }
}
