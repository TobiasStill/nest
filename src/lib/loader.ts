import {BufferGeometry, LoadingManager} from 'three';
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import Alerts from './alerts';

const el = document.getElementById('loader');
const progress = el.getElementsByClassName('percent')[0];

function show(){
    el.style.display = 'inline-block';
}

function hide(){
    el.style.display = 'none';
}


function onProgress(pe: ProgressEvent) {
    if (pe.lengthComputable) {
        const percent = `${Math.ceil((pe.loaded / pe.total) * 100)}%`;
        progress.textContent = percent;
    }
}

function initLoadingManager() {
    var manager = new LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        show();
    };
    manager.onLoad = function () {
        console.log('Loading complete!');
        hide();
    };
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    manager.onError = function (url) {
        console.log('There was an error loading ' + url);
        Alerts.showError('There was an error loading ' + url);
        hide();
    };
    return manager;
}

function loadPly(model: string, resolve: (geometry: BufferGeometry)=>void, reject) {
    var loader = new PLYLoader(initLoadingManager());
    loader.load(model, resolve, onProgress, reject);
}

function loadGltfDraco(model: string, resolve: (gltf: GLTF) => void, reject) {
    var loader = new GLTFLoader(initLoadingManager());
    const draco = new DRACOLoader();
    draco.setDecoderPath('/public/');
    loader.setDRACOLoader(draco);
    loader.load(model, resolve, onProgress, reject);
}

function loadGlb(model: string, resolve: (gltf: GLTF) => void, reject) {
    var loader = new GLTFLoader(initLoadingManager());
    loader.load(model, resolve, onProgress, reject);
}

export default {
    initLoadingManager,
    onProgress,
    loadPly,
    loadGltfDraco,
    loadGlb,
    show,
    hide,
}