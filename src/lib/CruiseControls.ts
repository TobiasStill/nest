import {
    MathUtils,
    PerspectiveCamera,
    Quaternion, Vector2,
    Vector3
} from 'three';
import {Events, PointerPosition} from './Events';

interface MoveState {
    up: number,
    down: number,
    left: number,
    right: number,
    forward: number,
    back: number,
    pitchUp: number,
    pitchDown: number,
    yawLeft: number,
    yawRight: number,
    rollLeft: number,
    rollRight: number
}

interface SpeedCurve {
    threshold: number;
    horizon: number;
    throttle: number;
}

export default class CruiseControls {

    public speedCurve: SpeedCurve = {threshold: 10, horizon: 10000, throttle: 3};
    public rollSpeed = 0.02;
    public dragSpeed = 0.02;
    private moveState: MoveState;
    private tmpQuaternion: Quaternion;
    private moveVector = new Vector3();
    private pinchVector = new Vector3();
    private rotationVector = new Vector3();
    private center = new Vector3();
    private dragVector = new Vector3();
    private pinchStart = new Vector2();
    private pinchEnd = new Vector2();
    private dragPointerStart: { x: number, y: number } | undefined;
    private contextmenu = (event: Event) => event.preventDefault();


    constructor(
        private camera: PerspectiveCamera,
        private domElement: HTMLElement
    ) {
        this.tmpQuaternion = new Quaternion();
        this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.register();
    }

    update(delta: number): boolean {

        const updated = this.updateMovement(delta) || this.updateRotation(delta) || this.updateDrag(delta) || this.updatePinch(delta);
        const logPosition = () => {
            const {x, y, z} = this.camera.position;
            console.log(`camera position: x=${x}, y=${y}, z=${z}`);
        };
        return updated;
    };

    private updateMovement(delta: number): boolean {
        if (!(this.moveVector.x || this.moveVector.y || this.moveVector.z)) {
            return false;
        }
        const moveMult = delta * 500 * this.getCurvedSpeed();
        //console.log(`delta: ${delta}`);

        this.camera.translateX(this.moveVector.x * moveMult);
        this.camera.translateY(this.moveVector.y * moveMult);
        this.camera.translateZ(this.moveVector.z * moveMult);

        return true;
    };

    private updateRotation(delta: number): boolean {
        if (!(this.rotationVector.x || this.rotationVector.y || this.rotationVector.z)) {
            return false;
        }
        const rotMult = this.rollSpeed;

        this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
        this.camera.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);

        return true;
    };

    private updateDrag(delta: number): boolean {
        if (!this.dragVector.x && !this.dragVector.y) {
            return false;
        }

        this.tmpQuaternion.set(this.dragVector.x, this.dragVector.y, this.dragVector.z, 1).normalize();
        this.camera.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
        this.dragVector.set(0, 0, 0);
        // console.log('dragRotation:', [this.dragVector.x, this.dragVector.y, this.dragVector.z]);

        return true;
    };

    private updatePinch(delta: number): boolean {
        if (this.pinchVector.z === 0) {
            return false;
        }
        //console.log(`traveldistance: ${this.distance}`);
        //console.log(`updateTravel: delta = ${delta}`);
        const factor = this.getCurvedSpeed() * delta * 100;

        this.camera.translateZ(this.pinchVector.z * factor);
        this.pinchVector.z = 0;
        return true;
    };

    private getCurvedSpeed() {
        const {horizon, threshold, throttle} = this.speedCurve;
        const distance = MathUtils.clamp(this.camera.position.sub(this.center).length(), threshold, horizon);
        const factor = throttle * Math.sin((distance / horizon) * (Math.PI / 2));
        //console.log(`factor: ${factor}`);
        return factor;
    }

    private startDragging(position: PointerPosition) {
        this.dragPointerStart = position;
    }

    private endDragging() {
        this.dragPointerStart = undefined;
    }

    private isDragging() {
        return !!this.dragPointerStart;
    }

    private updateMovementVector() {
        const forward = (this.moveState.forward) ? 1 : 0;
        this.moveVector.x = (-this.moveState.left + this.moveState.right);
        this.moveVector.y = (-this.moveState.down + this.moveState.up);
        this.moveVector.z = (-forward + this.moveState.back);
        //console.log('move:', [this.moveVector.x, this.moveVector.y, this.moveVector.z]);
        //this.onChange();
    };

    private updatePinchVector(distance: number) {
        this.pinchVector.z = distance;
        //console.log(`updateTravelVector: distance = ${this.distance}`);
        //this.onChange();
    };

    private updateDragVector(up: number, right: number) {
        this.dragVector.x = (this.dragSpeed * 0.25 * -right);
        this.dragVector.y = (this.dragSpeed * 0.25 * -up);
        //console.log('dragRotation:', [this.dragVector.x, this.dragVector.y, this.dragVector.z]);
        //this.onChange();
    };

    private updateRotationVector() {
        this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
        this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
        //console.log('rotate:', [this.rotationVector.x, this.rotationVector.y, this.rotationVector.z]);
        //this.onChange();
    };

    private getContainerDimensions() {
        return {
            size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
            offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
        };
    };

    private onTouchMove(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!Events.Touch.isMultiTouch(event)) {
            if (this.dragPointerStart) {
                const {x, y} = Events.Touch.getPosition(Events.Touch.getTouch(event, 0));
                const up = MathUtils.clamp(this.dragPointerStart.x - x, -3, 3);
                const right = MathUtils.clamp(this.dragPointerStart.y - y, -3, 3);
                this.updateDragVector(up, right);
                this.startDragging({x, y});
            }

        } else {
            const pos1 = Events.Touch.getPosition(Events.Touch.getTouch(event, 0));
            const pos2 = Events.Touch.getPosition(Events.Touch.getTouch(event, 1));
            const dx = (pos1.x - pos2.x);
            const dy = (pos1.y - pos2.y);
            const delta = Math.sqrt(dx * dx + dy * dy);
            //console.log(`onTouchMove: delta=${delta}`);
            this.pinchEnd.set(0, delta);
            if (this.pinchEnd.length() === this.pinchStart.length()) {
                return;
            }
            const distance = MathUtils.clamp((this.pinchStart.y - this.pinchEnd.y) * 4, -30, 30);
            this.updatePinchVector(distance);
            //console.log(`onTouchMove: distance=${this.distance}`);
            this.pinchStart.copy(this.pinchEnd);
        }
    }

    private onTouchStart(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!Events.Touch.isMultiTouch(event)) {
            this.startDragging(Events.Touch.getPosition(Events.Touch.getTouch(event, 0)));
            //console.log(`onTouchStart set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
        }
    };

    private onTouchEnd(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!Events.Touch.isMultiTouch(event)) {
            this.endDragging();
        }
    };

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.startDragging(Events.Pointer.getPosition(event));
        //console.log(`onMouseDown: set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
    };

    private onMouseMove(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (this.isDragging()) {
            const position = Events.Pointer.getPosition(event);
            const up = MathUtils.clamp(this.dragPointerStart.x - position.x, -30, 30) * 0.1;
            const right = MathUtils.clamp(this.dragPointerStart.y - position.y, -30, 30) * 0.1;
            //console.log(`onMouseMove: position x=${position.x}, y=${position.y}`);
            this.updateDragVector(up, right);
            this.startDragging(position);
        }
    };

    private onMouseUp(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        //console.log(`onMouseUp: client x=${event.clientX}, y=${event.clientY}`);
        this.endDragging();
    };

    private onMouseLeave(event: MouseEvent) {
        this.onMouseUp(event);
    };

    private onMouseWheel(event: WheelEvent) {
        event.preventDefault();
        event.stopPropagation();
        const distance = Events.MouseWheel.getDelta(event).distance;
        this.updatePinchVector(distance);
    }

    private onKeyDown(event: KeyboardEvent) {

        switch (event.keyCode) {

            case 87: /*W*/
                this.moveState.forward = 1;
                break;
            case 83: /*S*/
                this.moveState.back = 1;
                break;
            case 65: /*A*/
                this.moveState.left = 1;
                break;
            case 68: /*D*/
                this.moveState.right = 1;
                break;
            case 82: /*R*/
                this.moveState.up = 1;
                break;
            case 70: /*F*/
                this.moveState.down = 1;
                break;

            case 38: /*ArrowUp*/
                this.moveState.pitchUp = 1;
                break;
            case 40: /*ArrowDown*/
                this.moveState.pitchDown = 1;
                break;

            case 37: /*ArrowLeft*/
                this.moveState.yawLeft = 1;
                break;
            case 39: /*ArrowRight*/
                this.moveState.yawRight = 1;
                break;

            case 81: /*Q*/
                this.moveState.rollLeft = 1;
                break;
            case 69: /*E*/
                this.moveState.rollRight = 1;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    private onKeyUp(event: KeyboardEvent) {

        switch (event.keyCode) {

            case 87: /*W*/
                this.moveState.forward = 0;
                break;
            case 83: /*S*/
                this.moveState.back = 0;
                break;

            case 65: /*A*/
                this.moveState.left = 0;
                break;
            case 68: /*D*/
                this.moveState.right = 0;
                break;
            case 82: /*R*/
                this.moveState.up = 0;
                break;
            case 70: /*F*/
                this.moveState.down = 0;
                break;

            case 38: /*up*/
                this.moveState.pitchUp = 0;
                break;
            case 40: /*down*/
                this.moveState.pitchDown = 0;
                break;

            case 37: /*left*/
                this.moveState.yawLeft = 0;
                break;
            case 39: /*right*/
                this.moveState.yawRight = 0;
                break;

            case 81: /*Q*/
                this.moveState.rollLeft = 0;
                break;
            case 69: /*E*/
                this.moveState.rollRight = 0;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    private register() {

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('mousemove', this.onMouseMove, false);
        this.domElement.addEventListener('mouseup', this.onMouseUp, false);
        this.domElement.addEventListener('mouseleave', this.onMouseLeave, false);
        this.domElement.addEventListener(Events.MouseWheel.name, this.onMouseWheel, false);

        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);

        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);

    };

    private dispose() {

        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('mousemove', this.onMouseMove, false);
        this.domElement.removeEventListener('mouseup', this.onMouseUp, false);
        this.domElement.removeEventListener('mouseleave', this.onMouseLeave, false);
        this.domElement.removeEventListener(Events.MouseWheel.name, this.onMouseWheel, false);

        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);

        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('keyup', this.onKeyUp, false);

    };
};