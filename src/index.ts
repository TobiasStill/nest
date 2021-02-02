import {World} from './lib/world';
import * as Menu from './lib/menu';
import Loader from './lib/loader';
import Alerts from './lib/alerts';
import {variants, WorldVariant, WorldVariants} from './world-settings';
import {ModelSelector} from './lib/model-selector';
import {ModelUrl, models, ModelProperties} from './model';

document.getElementById('no-support').style.display = 'none';
window.onerror = Alerts.onError;
window.addEventListener('unhandledrejection', event => {
    Alerts.showError(`UNHANDLED PROMISE REJECTION: ${event.reason.error ? event.reason.error : 'Unknown Error'}`);
});
//Alerts.showAlert('test');
try {
// Set up the scene.
    Loader.hide();
    Menu.init();
    const selector = new ModelSelector(
        document.getElementById('model-selector'),
        [models.glbLow, models.glbMid],
        (model: ModelProperties) => {
        selector.hide();
        const world = new World(
            variants[WorldVariants[0]],
            model,
            () => {
                Menu.initVariants((variant: WorldVariant) => {
                    world.applySettings(variants[variant]);
                });
            },
            (e: Error) => {
                Alerts.showError(`
        <h2>Loading / Initializing Model Failed.</h2>
        <p>Please check your internet connection or hit refresh.</p>
        <p>[${e.message}]</p>`
                );
            });
    });
    selector.show();

} catch (e) {
    Alerts.showError(e.toString());
    throw(e);
}
