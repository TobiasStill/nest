import model from './model/ply/cube.ply';
import settings from './settings/bw';
import {
    AmbientLight,
    Scene,
    Color,
    Clock,
    LoadingManager,
    MeshLambertMaterial,
    MeshBasicMaterial,
    Mesh,
    PerspectiveCamera,
    PointLight,
    SphereGeometry,
    SpotLight,
    Vector3,
    WebGLRenderer,
    MOUSE,
    TOUCH
} from 'Three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
//import {CruiseControls} from './CruiseControls.js';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'stats-js/src/Stats';
import {CruiseControls} from './lib/CruiseControls';
// Set up the scene, camera, and renderer as global variables.
var scene, mesh, stats, controls, clock, camera, renderer;


function initManager() {
    var manager = new LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    manager.onLoad = function () {
        console.log('Loading complete!');
        document.getElementById('loader').style.display = 'none';
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    manager.onError = function (url) {
        console.log('There was an error loading ' + url);
    };
    return manager;
}

function loadPLY(settings, resolve, reject) {
    var loader = new PLYLoader(initManager());
    loader.load(model, function (geometry) {
        //loader.load('./model/ply/nest_full_LOD4.ply', function (geometry) {
        var material = new MeshLambertMaterial({color: settings.mesh.color});
        mesh = new Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = settings.mesh.castShadow;
        mesh.receiveShadow = settings.mesh.receiveShadow;
        scene.add(mesh);
        resolve();
    }, reject);
}

function loadGLTF(settings, resolve, reject) {
    var loader = new GLTFLoader(initManager());
    loader.load(model, function (gltf) {
        mesh = gltf.scene;
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = settings.mesh.castShadow;
        mesh.receiveShadow = settings.mesh.receiveShadow;
        mesh.material.color.set(hexEncodeColor(settings.mesh.color));
        scene.add(mesh);
        resolve();
    }, reject);
}

function handleResize() {
    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function () {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });
}

function addSpheres() {

    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    for (var z = -1000; z < 1000; z += 10) {

        // Make a sphere (exactly the same as before).
        var geometry = new SphereGeometry(0.5, 32, 32);
        var material = new MeshBasicMaterial({color: 0x000000});
        var sphere = new Mesh(geometry, material);

        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        // Then set the z position to where it is in the loop (distance of camera)
        sphere.position.z = z;

        // scale it up a bit
        sphere.scale.x = sphere.scale.y = 2;

        //add the sphere to the scene
        scene.add(sphere);

        //finally push it to the stars array
        //stars.push(sphere);
    }
}

function hexEncodeColor(str) {
    return new Color(str).getHex();
}

var ambientLight, pointLight, spotLight;

function initLights(settings) {
    if (settings.ambient) {
        ambientLight = new AmbientLight();
        setAmbientLight(settings.ambient);
        scene.add(ambientLight);
    }
    if (settings.pointlight) {
        pointLight = new PointLight();
        setPointLight(settings.pointlight);
        scene.add(pointLight);
    }
    if (settings.spotlight) {
        spotLight = new SpotLight();
        setSpotlight(settings.spotlight);
        scene.add(spotLight);
    }
}

function setAmbientLight(settings) {
    ambientLight.color.set(hexEncodeColor(settings.color))
}

function setSpotlight(settings) {
    spotLight.color.set(hexEncodeColor(settings.color));
    spotLight.position.set(...settings.position);
    spotLight.castShadow = settings.castShadow;
    spotLight.intensity = settings.intensity;
    //spotLight.shadow.autoUpdate = false;
    spotLight.shadow.mapSize.width = settings.shadow_mapSize_width;
    spotLight.shadow.mapSize.height = settings.shadow_mapSize_height;
    spotLight.shadow.camera.near = settings.shadow_camera_near;
    spotLight.shadow.camera.far = settings.shadow_camera_far;
    spotLight.shadow.camera.fov = settings.shadow_camera_fov;
}

function setPointLight(settings) {
    pointLight.color.set(hexEncodeColor(settings.color));
    pointLight.position.set(...settings.position);
    pointLight.castShadow = settings.castShadow;
    pointLight.intensity = settings.intensity;
    //pointLight.shadow.autoUpdate = false;
    pointLight.shadow.mapSize.width = settings.shadow_mapSize_width;
    pointLight.shadow.mapSize.height = settings.shadow_mapSize_height;
    pointLight.shadow.camera.near = settings.shadow_camera_near;
    pointLight.shadow.camera.far = settings.shadow_camera_far;
    pointLight.shadow.camera.fov = settings.shadow_camera_fov;
}

function applySettings(settings) {
    if (mesh) {
        mesh.material.color.set(hexEncodeColor(settings.mesh.color));
        mesh.receiveShadow = settings.mesh.receiveShadow;
        mesh.castShadow = settings.mesh.castShadow;
    }
    scene.background = new Color(settings.background);
    scene.remove(ambientLight);
    scene.remove(pointLight);
    scene.remove(spotLight);
    if (settings.ambient) {
        setAmbientLight(settings.ambient);
        scene.add(ambientLight);
    }
    if (settings.pointlight) {
        setPointLight(settings.pointlight);
        scene.add(pointLight);
    }
    if (settings.spotlight) {
        setSpotlight(settings.spotlight);
        scene.add(spotLight);
    }
}

// Sets up the scene.
function init(settings) {
    clock = new Clock();
    // Create the scene and set the scene size.
    scene = new Scene();

    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    // Create a renderer and add it to the DOM.
    renderer = new WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.id = 'context';
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    camera = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100000);
    camera.position.set(0, 100, 0);
    camera.lookAt(new Vector3(0, 0, 0));
    scene.add(camera);


    handleResize();

    stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.dom);

    scene.background = new Color(settings.background);
    addSpheres();

    initLights(settings);

    loadPLY(settings, () => {
        // Add Controls so that we can move around with the mouse.
        controls = new CruiseControls(camera, renderer.domElement);
        controls.update();
        render();
        controls.onChange(render);
    }, () => {
    });
}


// Renders the scene and updates the render as needed.
function render() {
    stats.begin();
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    stats.end();
}

init(settings);