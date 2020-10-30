import {LightSettings, Settings} from '../settings/settings';
import * as THREE from 'three';
//import CameraControls from 'camera-controls';
import CruiseControls from './CruiseControls';

import Stats from 'stats-js/src/Stats';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {hexEncodeColor, setAmbientLight, setLight} from './helper';
import CruiseControls2 from './CruiseControls2';
import Loader from './loader';
import model from '../model/ply/nest_full_LOD4.ply';
// const model = require('../model/ply/nest_full_LOD4.ply');
//import model from '../model/ply/Lucy100k.ply';
//import model from '../model/ply/cube.ply';

export class World {
    private scene: THREE.Scene;
    private mesh: THREE.Mesh;
    private stats: Stats;
    private controls: CruiseControls;
    private clock: THREE.Clock;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private WIDTH: number;
    private HEIGHT: number;
    private frame: number = 0;

    constructor(private settings: Settings) {
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;

        // Create a renderer and add it to the DOM.
        this.initRenderer();
        this.init();
    }

    private init() {
        this.clock = new THREE.Clock();
        // Create the scene and set the scene size.
        this.scene = new THREE.Scene();

        // Create a camera, zoom it out from the model a bit, and add it to the scene.
        this.initCamera();

        this.addStats();

        // add event listener on resize
        this.addResizeListener();

        //this.addSpheres();

        //this.addGridHelper();

        this.initLights();

        this.initControls();

        this.loadPly(model, () => {
            this.scene.background = new THREE.Color(this.settings.background);
            this.render();
            this.animate();
        }, () => {
        });
    }


    private initCamera() {
        this.camera = new THREE.PerspectiveCamera(45, this.WIDTH / this.HEIGHT, 0.1, 100000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
    }

    private initRenderer() {
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'high-performance'});
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.id = 'context';
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.addAddContextLostListener();
    }

    private initControls() {
        this.controls = new CruiseControls(this.camera, this.renderer.domElement);
        //this.controls = new CruiseControls2(this.camera, this.scene, );
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
            this.WIDTH = window.innerWidth;
            this.HEIGHT = window.innerHeight;
            this.renderer.setSize(this.WIDTH, this.HEIGHT);
            this.camera.aspect = this.WIDTH / this.HEIGHT;
            this.camera.updateProjectionMatrix();
            this.render();
        });
    }

    private addAddContextLostListener() {
        this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
            console.warn('context lost!');
            event.preventDefault();
        });
        this.renderer.domElement.addEventListener('webglcontextrestored', (event) => {
            console.warn('context restored!');
            this.WIDTH = window.innerWidth;
            this.HEIGHT = window.innerHeight;
            this.init();
            event.preventDefault();
        });
    }

    private addGridHelper() {
        const gridHelper = new THREE.GridHelper(50, 50);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
    }

    private addStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    private plyOnLoad(resolve: () => {}) {
        return (geometry) => {
            var material = new THREE.MeshLambertMaterial({color: this.settings.mesh.color});
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.matrixAutoUpdate = false;
            this.mesh.castShadow = this.settings.mesh.castShadow;
            this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
            this.scene.add(this.mesh);
            this.render();
            resolve();
        }
    };

    private gltfOnLoad(resolve: () => {}) {
        return (gltf) => {
            this.mesh = <THREE.Mesh><unknown>gltf.scene; // Todo
            this.mesh.matrixAutoUpdate = false;
            this.mesh.castShadow = this.settings.mesh.castShadow;
            this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
            (<THREE.MeshLambertMaterial>this.mesh.material).color.set(hexEncodeColor(this.settings.mesh.color)); //Todo
            this.scene.add(this.mesh);
            resolve();
        }
    };

    private loadPly(model: string, resolve, reject) {
        var loader = new PLYLoader(Loader.initLoadingManager());
        loader.load(model, this.plyOnLoad(resolve), Loader.onProgress, reject);
    }

    private loadGltf(model: string, resolve, reject) {
        var loader = new GLTFLoader(Loader.initLoadingManager());
        loader.load(model, this.gltfOnLoad(resolve), Loader.onProgress, reject);
    }

    private addSpheres() {

        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
        for (var z = -1000; z < 1000; z += 10) {

            // Make a sphere (exactly the same as before).
            var geometry = new THREE.SphereGeometry(0.5, 32, 32);
            var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
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
    private animate() {
        this.frame && cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(this.animate.bind(this));
        const updated = this.controls.update(this.clock.getDelta());
        if (updated) {
            //console.log('updated');
            this.render();
            this.stats.update();
        }
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
}
