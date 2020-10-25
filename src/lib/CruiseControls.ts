import CameraControls from 'camera-controls';
import * as THREE from 'three';

const isMac = /Mac/.test(navigator.platform);

export default class CruiseControls extends CameraControls {
    constructor(
        camera: THREE.PerspectiveCamera,
        domElement: HTMLElement
    ) {
        super(camera, domElement);
        this.mouseButtons.wheel = CruiseControls.ACTION.NONE;

        const onMouseWheel = (event: WheelEvent): void => {

            event.preventDefault();

            const deltaYFactor = isMac ? -1 : -3;
            const distance = (event.deltaMode === 1) ? event.deltaY / deltaYFactor : event.deltaY / (deltaYFactor * 10);

            var lookAtVector = new THREE.Vector3(0, 0, -1);
            lookAtVector.applyQuaternion(camera.quaternion);

            console.log(lookAtVector.x, lookAtVector.y, lookAtVector.z)

            this.forward(distance);

            this.dispatchEvent({
                type: 'control',
                originalEvent: event,
            });

        };
        this._domElement.addEventListener('wheel', onMouseWheel);
    }
}