import {World} from './lib/world';
import * as Menu from './lib/menu';
import Alerts from './lib/alerts';
import {variants, WorldVariant, WorldVariants} from './settings/settings';

window.onerror = Alerts.onError;
window.addEventListener("unhandledrejection", event => {
  Alerts.showError(`UNHANDLED PROMISE REJECTION: ${event.reason.error ? event.reason.error : 'Unknown Error'}`);
});
//Alerts.showAlert('test');
try {
// Set up the scene.
    Menu.init();
    const world = new World(
        variants[WorldVariants[0]],
        () => {
            Menu.initVariants((variant: WorldVariant) => {
                world.applySettings(variants[variant]);
            });
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
