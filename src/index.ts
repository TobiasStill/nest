import {World} from './lib/world';
import * as Menu from './lib/menu';
import settings from './settings/pink-orange';
import Alerts from './lib/alerts';
import {openFullscreen} from './lib/helper';

window.onerror = Alerts.onError;
window.addEventListener("unhandledrejection", event => {
  Alerts.showError(`UNHANDLED PROMISE REJECTION: ${event.reason.error ? event.reason.error : 'Unknown Error'}`);
});
//Alerts.showAlert('test');
try {
// Set up the scene.
    Menu.init();
    const world = new World(
        settings,
        () => {
        },
        (event: ErrorEvent) => {
            Alerts.showError(`
        <h2>Loading / Initializing Model Failed.</h2>
        <p>Please check your internet connection or hit refresh.</p>
        <p>[${event.message}]</p>`
            );
        });
} catch (e) {
    Alerts.showError(e.toString());
    throw(e);
}
