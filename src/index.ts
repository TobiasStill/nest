
import {Settings} from './settings/settings';
import {World} from './lib/world';
import settings from './settings/bw';


// Sets up the scene.
function init(settings: Settings) {
    const world = new World(settings);
}

init(settings);