import {
    MathUtils,
    PerspectiveCamera,
    Quaternion,
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
    private moveVector: Vector3;
    private travelVector: Vector3;
    private rotationVector: Vector3;
    private center: Vector3;
    private dragVector: Vector3;
    private dragStart: { clientX: number, clientY: number } | undefined;
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
        this.moveVector = new Vector3(0, 0, 0);
        this.travelVector = new Vector3(0, 0, 0);
        this.rotationVector = new Vector3(0, 0, 0);
        this.dragVector = new Vector3(0, 0, 0);
        this.center = new Vector3(0, 0, 0);
        this.mousemove = this.mousemove.bind(this);
        this.mousedown = this.mousedown.bind(this);
        this.mouseup = this.mouseup.bind(this);
        this.mousewheel = this.mousewheel.bind(this);
        this.keydown = this.keydown.bind(this);
        this.keyup = this.keyup.bind(this);
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
        //console.log(`distance: ${distance}`);
        //console.log(`factor: ${factor}`);
        return factor;
    }

    private dragging(event: MouseEvent) {
        const deltaX = this.dragStart.clientX - event.clientX;
        const deltaY = this.dragStart.clientY - event.clientY;

        this.dragState.right = deltaX;
        this.dragState.up = deltaY;

        //console.log(`dragging: delta-x= ${deltaX}, delty-y= ${deltaY}`);
        //console.log(`dragging: dragState.up= ${this.dragState.up} dragState.right= ${this.dragState.right}`);

        this.updateDragVector();
        this.startDragging(event);
    }

    private startDragging(event: MouseEvent) {
        this.dragStart = {clientX: event.clientX, clientY: event.clientY};
        this.dragState = {up: 0, right: 0};
    }

    private endDragging() {
        this.dragStart = this.dragState = undefined;
    }

    private isDragging() {
        return !!this.dragStart && (!!this.dragState || (!this.dragState.up && !this.dragState.right));
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


    private mousewheel(event: WheelEvent) {
        const deltaYFactor = isMac ? -1 : -3;
        this.distance = (event.deltaMode === 1) ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);
        this.updateTravelVector();
    }

    private keydown(event: KeyboardEvent) {

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

    private keyup(event: KeyboardEvent) {

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

    private mousedown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.startDragging(event);
    };

    private mousemove(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (this.isDragging()) {
            this.dragging(event);
        }
    };

    private mouseup(event) {
        event.preventDefault();
        event.stopPropagation();
        this.endDragging();
    };

    private dispose() {

        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this.mousedown, false);
        this.domElement.removeEventListener('mousemove', this.mousemove, false);
        this.domElement.removeEventListener('mouseup', this.mouseup, false);
        this.domElement.removeEventListener('mouseleave', this.mouseup, false);
        this.domElement.removeEventListener('mousewheel', this.mousewheel, false);

        window.removeEventListener('keydown', this.keydown, false);
        window.removeEventListener('keyup', this.keyup, false);

    };

    private register() {

        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousedown', this.mousedown, false);
        this.domElement.addEventListener('mousemove', this.mousemove, false);
        this.domElement.addEventListener('mouseup', this.mouseup, false);
        this.domElement.addEventListener('mouseleave', this.mouseup, false);
        this.domElement.addEventListener('mousewheel', this.mousewheel, false);

        window.addEventListener('keydown', this.keydown, false);
        window.addEventListener('keyup', this.keyup, false);

        this.updateMovementVector();
        this.updateRotationVector();

    };
};
