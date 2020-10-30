import {LoadingManager} from 'three';

const htmlElement = document.getElementById('loader');
const progress = htmlElement.getElementsByClassName('percent')[0];

export default {
    onProgress: (pe: ProgressEvent) => {
        if (pe.lengthComputable) {
            const percent = `${Math.ceil((pe.loaded / pe.total) * 100)}%`;
            progress.textContent = percent;
        }
    },
    initLoadingManager() {
        var manager = new LoadingManager();
        manager.onStart = function (url, itemsLoaded, itemsTotal) {
            console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };
        manager.onLoad = function () {
            console.log('Loading complete!');
            htmlElement.style.display = 'none';
        };
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };
        manager.onError = function (url) {
            console.log('There was an error loading ' + url);
        };
        return manager;
    }
}