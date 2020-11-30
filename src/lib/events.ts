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

const mouseWheelEvent = (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel';

const getTouches = (evt: TouchEvent) => {
    return evt.targetTouches;
};

const devicePixelRatio = window.devicePixelRatio || 1;

export const Events = {
    devicePixelRatio,
    MouseWheel: {
        name: mouseWheelEvent,
        getDelta: (evt: SomeWheelEvent): TravelDistance => {
            let delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta ? evt.wheelDelta : evt.deltaY;
            //console.log(`delta = ${delta}`);
            const distance = (evt.deltaMode === 1) ? delta / -devicePixelRatio : delta / (-devicePixelRatio * 10);
            return {distance};
        }
    },

    Pointer: {
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
    },

    Touch: {
        getPosition: (touch: SomeTouch): PointerPosition => {
            let x = touch.pageX / devicePixelRatio;
            let y = touch.pageY / devicePixelRatio;
            return {x, y};
        },
        getTouches,
        getTouch(evt: TouchEvent, i: number) {
            const touches = getTouches(evt);
            return touches[i];
        },
        isMultiTouch(evt: TouchEvent) {
            return getTouches(evt).length > 1;
        }
    }
};
