import './css/main.css';
import {World} from './lib/world';
import * as Menu from './lib/menu';
import settings from './settings/pink-orange';
import {showAlert} from './lib/alerts';

// Set up the scene.
const world = new World(settings, () => {
    Menu.init();
    Menu.openMenu();
}, () => {
    showAlert(`<h2>Loading Failed!</h2><p>Please check your internet connection or try again later.</p>`);
});