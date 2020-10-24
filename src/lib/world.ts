import {LightSettings, Settings} from '../settings/settings';
import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({THREE: THREE});
import Stats from 'stats-js/src/Stats';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {initManager} from './init-manager';
import {hexEncodeColor, setAmbientLight, setLight} from './helper';
//import model from '../model/ply/nest_full_LOD2.ply';
//import model from '../model/ply/Lucy100k.ply';
import model from '../model/ply/cube.ply';

export class World {
    private scene: THREE.Scene;
    private mesh: THREE.Mesh;
    private stats: Stats;
    private controls: CameraControls;
    private clock: THREE.Clock;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    constructor(private settings: Settings) {
        const WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;

        // Create a renderer and add it to the DOM.
        this.initRenderer(WIDTH, HEIGHT);
        this.init(WIDTH, HEIGHT);
    }

    private init(WIDTH: number, HEIGHT: number) {
        this.clock = new THREE.Clock();
        // Create the scene and set the scene size.
        this.scene = new THREE.Scene();

        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this.initCamera(WIDTH, HEIGHT);

        this.addStats();

        // add event listener on resize
        this.addResizeListener();

        this.scene.background = new THREE.Color(this.settings.background);

        this.addSpheres();

        this.initLights();

        this.initControls();

        this.loadPLY(model, () => {
        }, () => {
        });

        this.render();
    }


    private initCamera(WIDTH: number, HEIGHT: number) {
        this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100000);
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
    }

    private initRenderer(WIDTH: number, HEIGHT: number) {
        this.renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
        this.renderer.setSize(WIDTH, HEIGHT);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.id = 'context';
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.addAddContextLostListener();
    }

    private initControls() {
        this.controls = new CameraControls(this.camera, this.renderer.domElement);
        //this.controls.infinityDolly = true;
    }

    private initLights() {
        if (this.settings.ambient) {
            const light = new THREE.AmbientLight();
            setAmbientLight(light, this.settings.ambient);
            this.scene.add(light);
        }
        if (this.settings.pointlight) {
            const light = new THREE.PointLight();
            setLight(light, this.settings.pointlight);
            this.scene.add(light);
        }
        if (this.settings.spotlight) {
            const light = new THREE.SpotLight();
            setLight(light, this.settings.spotlight);
            this.scene.add(light);
        }
    }

    private addResizeListener() {
        window.addEventListener('resize', () => {
            var WIDTH = window.innerWidth,
                HEIGHT = window.innerHeight;
            this.renderer.setSize(WIDTH, HEIGHT);
            this.camera.aspect = WIDTH / HEIGHT;
            this.camera.updateProjectionMatrix();
        });
    }

    private addAddContextLostListener() {
        this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
            console.warn('context lost!');
            event.preventDefault();
        });
        this.renderer.domElement.addEventListener('webglcontextrestored', (event) => {
            console.warn('context restored!');
            var WIDTH = window.innerWidth,
                HEIGHT = window.innerHeight;
            this.init(WIDTH, HEIGHT);
            event.preventDefault();
        });
    }

    private addStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    private loadPLY(model: string, resolve, reject) {
        var loader = new PLYLoader(initManager());
        loader.load(model, (geometry) => {
            var material = new THREE.MeshStandardMaterial({color: this.settings.mesh.color});
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.matrixAutoUpdate = false;
            this.mesh.castShadow = this.settings.mesh.castShadow;
            this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
            this.scene.add(this.mesh);
            resolve();
        }, reject);
    }

    private loadGLTF(model: string, resolve, reject) {
        var loader = new GLTFLoader(initManager());
        loader.load(model, (gltf) => {
            this.mesh = <THREE.Mesh><unknown>gltf.scene; // Todo
            this.mesh.matrixAutoUpdate = false;
            this.mesh.castShadow = this.settings.mesh.castShadow;
            this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
            (<THREE.MeshLambertMaterial>this.mesh.material).color.set(hexEncodeColor(this.settings.mesh.color)); //Todo
            this.scene.add(this.mesh);
            resolve();
        }, reject);
    }

    private addSpheres() {

        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
        for (var z = -1000; z < 1000; z += 10) {

            // Make a sphere (exactly the same as before).
            var geometry = new THREE.SphereGeometry(0.5, 32, 32);
            var material = new THREE.MeshBasicMaterial({color: 0x000000});
            var spheres = new THREE.Mesh(geometry, material);

            // This time we give the sphere random x and y positions between -500 and 500
            spheres.position.x = Math.random() * 1000 - 500;
            spheres.position.y = Math.random() * 1000 - 500;

            // Then set the z position to where it is in the loop (distance of camera)
            spheres.position.z = z;

            // scale it up a bit
            spheres.scale.x = spheres.scale.y = 2;

            //add the sphere to the scene
            this.scene.add(spheres);
        }
    }

    // Renders the scene and updates the render as needed.
    private render() {
        this.stats.begin();
        const delta = this.clock.getDelta();
        const hasControlsUpdated = this.controls.update(delta);
        requestAnimationFrame(this.render.bind(this));
        if (hasControlsUpdated) {
            this.renderer.render(this.scene, this.camera);
        }
        this.stats.end();
    }
}
