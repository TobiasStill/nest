import {
    Quaternion,
    Vector3
} from "Three";

var CruiseControls = function (object, domElement) {

    if (domElement === undefined) {

        console.warn('THREE.FlyControls: The second parameter "domElement" is now mandatory.');
        domElement = document;

    }

    var onChange = [];

    this.object = object;
    this.domElement = domElement;

    if (domElement) this.domElement.setAttribute('tabindex', -1);

    // API

    this.movementSpeed = 1.0;
    this.rollSpeed = 0.05;

    // disable default target object behavior

    // internals

    this.tmpQuaternion = new Quaternion();

    this.mouseStatus = 0;

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
    this.rotationVector = new Vector3(0, 0, 0);

    this.mousedown = function (event) {

        if (this.domElement !== document) {

            this.domElement.focus();

        }

        event.preventDefault();
        event.stopPropagation();


    };

    this.mousemove = function (event) {

        var container = this.getContainerDimensions();
        var halfWidth = container.size[0] / 2;
        var halfHeight = container.size[1] / 2;

        this.moveState.yawLeft = -((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
        this.moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;

        this.updateRotationVector();

    };

    this.mouseup = function (event) {

        event.preventDefault();
        event.stopPropagation();


        this.moveState.yawLeft = this.moveState.pitchDown = 0;

        this.updateRotationVector();

    };

    this.mouseWheel = function (event) {

        event.preventDefault();
        event.stopPropagation();


        if (event.deltaY < 0) {

            this.moveState.forward = 1;
            this.moveState.back = 0;

        } else if (event.deltaY > 0) {

            this.moveState.forward = 0;
            this.moveState.back = 1;

        }

        this.updateMovementVector();

    };


    this.update = function (delta) {

        var moveMult = delta * this.movementSpeed;
        var rotMult = delta * this.rollSpeed;

        this.object.translateX(this.moveVector.x * moveMult);
        this.object.translateY(this.moveVector.y * moveMult);
        this.object.translateZ(this.moveVector.z * moveMult);

        this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
        this.object.quaternion.multiply(this.tmpQuaternion);

        // expose the rotation vector for convenience
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
        this.endMovement();
    };

    this.onChange = (fn) => {
        onChange.push(fn);
    };

    this.endMovement = function () {

        this.moveState.forward = 0;
        this.moveState.back = 0;

        this.moveVector.z = 0;

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

    };

    this.updateMovementVector = function () {

        var forward = (this.moveState.forward) ? 1 : 0;

        this.moveVector.x = (-this.moveState.left + this.moveState.right);
        this.moveVector.y = (-this.moveState.down + this.moveState.up);
        this.moveVector.z = (-forward + this.moveState.back);

        //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
        onChange.forEach(fn => fn());

    };

    this.updateRotationVector = function () {

        this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
        this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
        this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);

        //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
        onChange.forEach(fn => fn());

    };

    this.getContainerDimensions = function () {

        if (this.domElement != document) {

            return {
                size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
                offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
            };

        } else {

            return {
                size: [window.innerWidth, window.innerHeight],
                offset: [0, 0]
            };

        }

    };

    function bind(scope, fn) {

        return function () {

            fn.apply(scope, arguments);

        };

    }

    function contextmenu(event) {

        event.preventDefault();

    }

    this.dispose = function () {

        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        this.domElement.removeEventListener('mousedown', _mousedown, false);
        this.domElement.removeEventListener('mousemove', _mousemove, false);
        this.domElement.removeEventListener('mouseup', _mouseup, false);


    };

    var _mousemove = bind(this, this.mousemove);
    var _mousedown = bind(this, this.mousedown);
    var _mouseup = bind(this, this.mouseup);
    var _mouseWheel = bind(this, this.mouseWheel);

    this.domElement.addEventListener('contextmenu', contextmenu, false);

    this.domElement.addEventListener('mousemove', _mousemove, false);
    this.domElement.addEventListener('mousedown', _mousedown, false);
    this.domElement.addEventListener('mouseup', _mouseup, false);
    this.domElement.addEventListener('mousewheel', _mouseWheel, false);


    this.updateMovementVector();
    this.updateRotationVector();

};

export {CruiseControls};
