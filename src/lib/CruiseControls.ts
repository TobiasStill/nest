import {
    MathUtils,
    PerspectiveCamera,
    Quaternion, Vector2,
    Vector3
} from 'three';

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

const isMac = /Mac/.test(navigator.platform);

export default class CruiseControls {

    public movementSpeed = 10;
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
        var moveMult = delta * 100 * this.getSpeedFactor();
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
        var moveMult = Math.abs(this.distance) * this.getSpeedFactor();
        this.distance = 0;

        this.camera.translateX(this.travelVector.x * moveMult);
        this.camera.translateY(this.travelVector.y * moveMult);
        this.camera.translateZ(this.travelVector.z * moveMult);

        return true;
    };

    private getSpeedFactor() {
        const horizon = 10000;
        const distance = MathUtils.clamp(this.camera.position.sub(this.center).length(), 1, horizon);
        const factor = this.movementSpeed * Math.sin(distance * (Math.PI / 2 / horizon));
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

        //console.log('move:', [this.travelVector.x, this.travelVector.y, this.travelVector.z]);

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
        if (event.touches.length == 1) {
            if (this.dragPointerStart) {
                const pageX = event.touches[0].pageX;
                const pageY = event.touches[0].pageY;
                const deltaX = this.dragPointerStart.x - pageX;
                const deltaY = this.dragPointerStart.y - pageY;
                this.dragging(deltaX, deltaY);
                this.dragPointerStart = {x: pageX, y: pageY};
                //console.log(`onTouchMove set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
            }

        } else {
            const dx = (event.touches[0].pageX - event.touches[1].pageX);
            const dy = (event.touches[0].pageY - event.touches[1].pageY);
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.pinchEnd.set(0, distance);
            this.distance = MathUtils.clamp(this.pinchStart.y - this.pinchEnd.y, -10, 10);
            this.pinchStart.copy(this.pinchEnd);
            this.updateTravelVector();
        }
    }

    private onTouchStart(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (event.touches.length == 1) {
            const pageX = event.touches[0].pageX;
            const pageY = event.touches[0].pageY;
            this.dragPointerStart = {x: pageX, y: pageY};
            //console.log(`onTouchStart set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
        }
    };

    private onTouchEnd(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (event.touches.length == 1) {
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
        this.dragPointerStart = {x: event.clientX, y: event.clientY};
        //console.log(`onMouseDown: set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
    };

    private onMouseMove(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (this.dragPointerStart) {
            const deltaX = this.dragPointerStart.x - event.clientX;
            const deltaY = this.dragPointerStart.y - event.clientY;
            //console.log(`onMouseMove: client x=${event.clientX}, y=${event.clientY}`);
            this.dragging(deltaX, deltaY);
            this.dragPointerStart = {x: event.clientX, y: event.clientY};
            //console.log(`onMouseMove: set dragPointerStart x=${this.dragPointerStart.x}, y=${this.dragPointerStart.y}`);
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
        const deltaYFactor = isMac ? -1 : -3;
        this.distance = (event.deltaMode === 1) ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
        this.updateTravelVector();
    }

    private register() {

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('mousemove', this.onMouseMove, false);
        this.domElement.addEventListener('mouseup', this.onMouseUp, false);
        this.domElement.addEventListener('mouseleave', this.onMouseLeave, false);
        this.domElement.addEventListener('mousewheel', this.onMouseWheel, false);

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
        this.domElement.removeEventListener('mousewheel', this.onMouseWheel, false);

        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);

        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('keyup', this.onKeyUp, false);

    };
};