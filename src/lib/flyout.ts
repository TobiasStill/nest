const flyout = document.getElementById('flyout');
const content = flyout.getElementsByClassName('content')[0];

import {getPath} from './helper';

function flyoutIsOpen(id) {
    return flyout.style.display === 'block' && flyout.getAttribute('data-content-id') === id;
}

function openFlyout(id) {
    const source = document.getElementById(id);
    if (source) {
        //copy the source
        content.innerHTML = source.innerHTML;
        // set id
        flyout.setAttribute('data-content-id', id);
        // open the flyout
        flyout.style.display = 'block';
    }
}

export function closeFlyout() {
    flyout.style.display = 'none';
}

export function toggleFlyout(id): boolean {
    if (flyoutIsOpen(id)) {
        closeFlyout();
        return false;
    } else {
        openFlyout(id);
        return true;
    }
}

// close flyout on outside click
document.addEventListener('click', function (e: MouseEvent) {
    var clickedOutside = true;
    getPath(e).forEach(function (item) {
        if (!clickedOutside) {
            return;
        }
        if (item === flyout) {
            clickedOutside = false;
        }
    });
    if (clickedOutside) {
        closeFlyout();
    }
});
