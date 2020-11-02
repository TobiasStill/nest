import {Settings} from '../settings/settings';
import CruiseControls from './CruiseControls';

import Stats from 'stats-js/src/Stats';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {setAmbientLight, setLight} from './helper';
import Loader from './loader';
import Alerts from './alerts';

import {
    AmbientLight,
    BufferGeometry,
    Clock,
    Color, GridHelper,
    Group,
    Mesh, MeshBasicMaterial, MeshLambertMaterial,
    Object3D,
    PerspectiveCamera, PointLight,
    Scene, SphereGeometry, SpotLight,
    Vector3,
    WebGLRenderer
} from 'three';

// gltfpack GLB
const model = './model/glb/nest_full_LOD4.glb';
//import model from '../model/glb/nest_full_LOD2.glb';


//draco GLTF
//import model from '../model/glb/nest_full_LOD4.gltf';
//import model from '../model/glb/nest_full_LOD2.gltf';

// raw PLY
//import model from '../model/ply/nest_full_LOD4.ply';

// testing
//import model from '../model/ply/Lucy100k.ply';
//import model from '../model/ply/cube.ply';

export class World {
    private scene: Scene;
    private mesh: Mesh | Group;
    private stats: Stats;
    private controls: CruiseControls;
    private clock: Clock;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private WIDTH: number;
    private HEIGHT: number;
    private frame: number = 0;

    constructor(
        private settings: Settings,
        private onModelLoad: () => void,
        private onModelReject: (event: ErrorEvent) => void) {
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.init();
    }

    private init() {

        this.clock = new Clock();
        // Create the scene and set the scene size.
        this.scene = new Scene();

        Loader.loadGlb(model, (gltf: GLTF) => {
            // Create a renderer and add it to the DOM.
            this.initRenderer();
            // Create a camera, zoom it out from the model a bit, and add it to the scene.
            this.initCamera();

            //this.addStats();

            // add event listener on resize
            this.addResizeListener();

            //this.addSpheres();

            //this.addGridHelper();

            this.initLights();

            this.initControls();
            this.gltfOnLoad(gltf);
            this.scene.background = new Color(this.settings.background);
            //this.renderer.
            this.render();
            this.animate();
            this.onModelLoad();
        }, this.onModelReject);
    }


    private initCamera() {
        this.camera = new PerspectiveCamera(30, this.WIDTH / this.HEIGHT, 0.1, 10000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new Vector3(0, 0, 0));
        this.scene.add(this.camera);
    }

    private initRenderer() {
        this.renderer = new WebGLRenderer({alpha: false, antialias: true, powerPreference: 'high-performance'});
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
        this.renderer.domElement.id = 'context';
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.addAddContextLostListener();
    }

    private initControls() {
        this.controls = new CruiseControls(
            this.camera,
            this.renderer.domElement
        );
    }

    private initLights() {
        if (this.settings.ambient) {
            const light = new AmbientLight();
            setAmbientLight(light, this.settings.ambient);
            this.scene.add(light);
        }
        if (this.settings.pointlight) {
            const light = new PointLight();
            setLight(light, this.settings.pointlight);
            this.scene.add(light);
        }
        if (this.settings.spotlight) {
            const light = new SpotLight();
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
            event.preventDefault();
            console.warn('context lost!');
            Alerts.showError(`
                    <p><strong>WebGL Context Lost!</strong></p>
                    <p>Please wait for the application to recover or restart Browser.</p>
            `);
        });
        this.renderer.domElement.addEventListener('webglcontextrestored', (event) => {
            console.warn('context restored!');
            this.WIDTH = window.innerWidth;
            this.HEIGHT = window.innerHeight;
            this.init();
            Alerts.hideAlert();
            event.preventDefault();
        });
    }

    private addGridHelper() {
        const gridHelper = new GridHelper(50, 50);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
    }

    private addStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.getElementById('stats').appendChild(this.stats.dom);
    }

    private plyOnLoad(geometry: BufferGeometry) {
        var material = new MeshLambertMaterial({
            color: this.settings.mesh.color,
        });
        this.mesh = new Mesh(geometry, material);
        this.mesh.matrixAutoUpdate = false;
        this.mesh.castShadow = this.settings.mesh.castShadow;
        this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
        this.scene.add(this.mesh);
        this.render();
    };

    private gltfOnLoad(gltf: GLTF) {
        this.mesh = gltf.scene; // Todo
        this.mesh.matrixAutoUpdate = false;
        this.mesh.castShadow = this.settings.mesh.castShadow;
        this.mesh.receiveShadow = this.settings.mesh.receiveShadow;
        const material = new MeshLambertMaterial({color: this.settings.mesh.color});
        this.mesh.traverse((obj: Object3D) => {
            if (obj instanceof Mesh) {
                obj.material = material;
            }
        });
        this.scene.add(this.mesh);
    };


    private addSpheres() {

        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
        for (var z = -1000; z < 1000; z += 10) {

            // Make a sphere (exactly the same as before).
            var geometry = new SphereGeometry(0.5, 32, 32);
            var material = new MeshBasicMaterial({color: 0x00ff00});
            var spheres = new Mesh(geometry, material);

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
            this.stats && this.stats.update();
        }
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
}
