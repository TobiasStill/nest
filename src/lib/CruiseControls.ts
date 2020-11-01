import {
    MathUtils,
    PerspectiveCamera,
    Quaternion, Vector2,
    Vector3
} from 'three';
import {Events} from './Events';

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

interface DragState {
    up: number,
    right: number,
}

interface SpeedCurve{
    threshold: number;
    horizon: number;
    throttle: number;
}

export default class CruiseControls {

    public speedSettings: SpeedCurve = {threshold: 5, horizon: 1000, throttle: 5};
    public rollSpeed = 0.02;
    public dragSpeed = 0.003;
    private moveState: MoveState;
    private tmpQuaternion: Quaternion;
    private moveVector = new Vector3();
    private travelVector = new Vector3();
    private rotationVector = new Vector3();
    private center = new Vector3();
    private dragVector = new Vector3();
    private pinchStart = new Vector2();
    private pinchEnd = new Vector2();
    private dragPointerStart: { x: number, y: number } | undefined;
    private dragState: DragState | undefined;
    private distance: number;
    private contextmenu = (event: Event) => event.preventDefault();


    constructor(private camera: PerspectiveCamera, private domElement: HTMLElement) {
        this.tmpQuaternion = new Quaternion();
        this.distance = 0;
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
        this.dragState = {up: 0, right: 0};
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

        return this.updateMovement(delta) || this.updateRotation(delta) || this.updateDrag(delta) || this.updateTravel(delta);
    };

    private updateMovement(delta: number): boolean {
        if (!(this.moveVector.x || this.moveVector.y || this.moveVector.z)) {
            return false;
        }
        var moveMult = delta * 100 * this.getSpeedCurve();
        //console.log(`delta: ${delta * 100}`);

        this.camera.translateX(this.moveVector.x * moveMult);
        this.camera.translateY(this.moveVector.y * moveMult);
        this.camera.translateZ(this.moveVector.z * moveMult);

        return true;
    };

    private updateRotation(delta: number): boolean {
        if (!(this.rotationVector.x || this.rotationVector.y || this.rotationVector.z)) {
            return false;
        }
        var rotMult = this.rollSpeed;

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

    private updateTravel(delta: number): boolean {
        if (!this.distance) {
            return false;
        }
        //console.log(`traveldistance: ${this.distance}`);
        var moveMult = Math.abs(this.distance) * this.getSpeedCurve();
        this.distance = 0;

        this.camera.translateX(this.travelVector.x * moveMult);
        this.camera.translateY(this.travelVector.y * moveMult);
        this.camera.translateZ(this.travelVector.z * moveMult);

        return true;
    };

    private getSpeedCurve() {
        const {horizon, threshold, throttle} = this.speedSettings;
        const distance = MathUtils.clamp(this.camera.position.sub(this.center).length(), threshold, horizon);
        const factor = throttle * Math.sin(distance * (Math.PI / 2 / horizon));
        //console.log(`factor: ${factor}`);
        return factor;
    }

    private dragging(deltaX: number, deltaY: number) {

        this.dragState.right = deltaX;
        this.dragState.up = deltaY;

        //console.log(`dragging: delta-x= ${deltaX}, delty-y= ${deltaY}`);
        //console.log(`dragging: dragState.up= ${this.dragState.up} dragState.right= ${this.dragState.right}`);

        this.updateDragVector();
    }

    private endDragging() {
        this.dragPointerStart = undefined;
        this.dragState = {up: 0, right: 0};
    }

    private isDragging() {
        return this.dragState.up || this.dragState.right;
    }

    private updateMovementVector() {
        const forward = (this.moveState.forward) ? 1 : 0;
        this.moveVector.x = (-this.moveState.left + this.moveState.right);
        this.moveVector.y = (-this.moveState.down + this.moveState.up);
        this.moveVector.z = (-forward + this.moveState.back);

        //console.log('move:', [this.moveVector.x, this.moveVector.y, this.moveVector.z]);

    };

    private updateTravelVector() {
        this.travelVector.z = (this.distance * -1);
        //console.log(`updateTravelVector: distance = ${this.distance}`);
    };

    private updateDragVector() {
        this.dragVector.x = (this.dragSpeed * -this.dragState.up);
        this.dragVector.y = (this.dragSpeed * -this.dragState.right);
        //console.log('dragRotation:', [this.dragVector.x, this.dragVector.y, this.dragVector.z]);
    };

    private updateRotationVector() {
        this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
        this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);
        //console.log('rotate:', [this.rotationVector.x, this.rotationVector.y, this.rotationVector.z]);
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
                const deltaX = MathUtils.clamp(this.dragPointerStart.x - x, -30, 30);
                const deltaY = MathUtils.clamp(this.dragPointerStart.y - y, -30, 30);
                this.dragging(deltaX, deltaY);
                this.dragPointerStart = {x, y};
                //console.log(`onTouchMove set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
            }

        } else {
            const pos1 = Events.Touch.getPosition(Events.Touch.getTouch(event, 0));
            const pos2 = Events.Touch.getPosition(Events.Touch.getTouch(event, 1));
            const dx = (pos1.x - pos2.x);
            const dy = (pos1.y - pos2.y);
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.pinchEnd.set(0, distance);
            this.distance = (this.pinchStart.y - this.pinchEnd.y > 0)? 3: -3;
            this.pinchStart.copy(this.pinchEnd);
            this.updateTravelVector();
        }
    }

    private onTouchStart(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!Events.Touch.isMultiTouch(event)) {
            this.dragPointerStart = Events.Touch.getPosition(Events.Touch.getTouch(event, 0));
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

    private onKeyDown(event: KeyboardEvent) {

        switch (event.keyCode) {

            case 87: /*W*/
                this.moveState.forward = 1;
                break;
            case 83: /*S*/
                this.moveState.back = 1;
                break;

            case 65: /*A*/
                this.moveState.right = 1;
                break;
            case 68: /*D*/
                this.moveState.right = 1;
                break;

        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    private onKeyUp(event: KeyboardEvent) {

        switch (event.keyCode) {

            case 87: /*W*/
                this.moveState.forward = 0;
                this.distance = 0;
                break;
            case 83: /*S*/
                this.moveState.back = 0;
                this.distance = 0;
                break;

            case 65: /*A*/
                this.moveState.right = 0;
                this.distance = 0;
                break;
            case 68: /*D*/
                this.moveState.right = 0;
                this.distance = 0;
                break;
        }

        this.updateMovementVector();
        this.updateRotationVector();

    };

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.dragPointerStart = Events.Pointer.getPosition(event);
        //console.log(`onMouseDown: set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
    };

    private onMouseMove(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (this.dragPointerStart) {
            const position = Events.Pointer.getPosition(event);
            const deltaX = MathUtils.clamp(this.dragPointerStart.x - position.x, -30, 30);
            const deltaY = MathUtils.clamp(this.dragPointerStart.y - position.y, -30, 30);
            console.log(`onMouseMove: position x=${position.x}, y=${position.y}`);
            this.dragging(deltaX, deltaY);
            this.dragPointerStart = position;
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
        this.distance = Events.MouseWheel.getTravelDistance(event).distance / 4;
        this.updateTravelVector();
    }

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