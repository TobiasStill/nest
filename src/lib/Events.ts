import {MathUtils} from 'three';

export interface TravelDistance {
    distance: number;
}

export interface PointerPosition {
    x: number;
    y: number;
}

export type SomeWheelEvent = Event & { detail?: number, wheelDelta?: number, deltaY?: number, deltaMode?: number };
export type SomePointerEvent = Event
    & { pageX?: number, pageY?: number, clientX?: number, clientY?: number, x?: number, y?: number };
export type SomeTouch = Touch;
type ScaledVisualViewPort = VisualViewport & { scale: number };

const isMac = /Mac/.test(navigator.platform); // Todo
function getDevicePixelRatio() {
    const viewportScale = window.visualViewport && window.visualViewport.scale;
    return viewportScale ? viewportScale : isMac ? 1 : 3;
}

const devicePixelRatio = getDevicePixelRatio();

const mouseWheelEvent = (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel';

export namespace Events {
    export const MouseWheel = {
        name: mouseWheelEvent,
        getTravelDistance: (evt: SomeWheelEvent): TravelDistance => {
            let delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta ? evt.wheelDelta : evt.deltaY;
            //console.log(`delta = ${delta}`);
            const distance = (evt.deltaMode === 1) ? delta / -devicePixelRatio : delta / (-devicePixelRatio * 10);
            return {distance};
        }
    };

    export const Pointer = {
        getPosition: (evt: SomePointerEvent): PointerPosition => {
            let x = 0;
            let y = 0;
            if (evt.pageX || evt.pageY) {
                x = evt.pageX;
                y = evt.pageY;
            } else if (evt.clientX || evt.clientY) {
                x = evt.clientX + document.body.scrollLeft
                    + document.documentElement.scrollLeft;
                y = evt.clientY + document.body.scrollTop
                    + document.documentElement.scrollTop;
            }
            return {x, y};
        }
    };

    export const Touch = {
        getPosition: (touch: SomeTouch): PointerPosition => {
            let x = touch.pageX;
            let y = touch.pageY;
            return {x, y};
        },
        getTouches(evt: TouchEvent) {
            return evt.targetTouches;
        },
        getTouch(evt: TouchEvent, i: number) {
            const touches = Touch.getTouches(evt);
            return touches[i];
        },
        isMultiTouch(evt: TouchEvent) {
            return Touch.getTouches(evt).length > 1;
        }
    };
}
