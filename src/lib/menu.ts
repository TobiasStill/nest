import {getPath} from './helper';

const flyout = document.getElementById('flyout');
const flyoutContent = flyout.getElementsByClassName('content')[0];
const menu = document.getElementById('menu');
const nav = document.getElementsByTagName('nav')[0];
const opener = menu.getElementsByClassName('opener')[0];
const items = Array.from(nav.getElementsByTagName('li'));

function menuIsOpen() {
    return nav.style.display !== 'none';
}

function toggleMenu() {
    if (menuIsOpen()) {
        closeMenu()
    } else {
        openMenu();
    }
}

function toggleItem(contentId) {
    const active = toggleFlyout(contentId);
    items.forEach((item) => {
        const thisContentId = item.getAttribute('data-content-id');
        if (active && thisContentId === contentId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    })
}

function flyoutIsOpen(id) {
    return flyout.style.display === 'block' && flyout.getAttribute('data-content-id') === id;
}

function openFlyout(id) {
    const source = document.getElementById(id);
    if (source) {
        //copy the source
        flyoutContent.innerHTML = source.innerHTML;
        // set id
        flyout.setAttribute('data-content-id', id);
        // open the flyout
        flyout.style.display = 'block';
    }
}

function closeFlyout() {
    flyout.style.display = 'none';
    items.forEach((item) => {
        item.classList.remove('active');
    })
}

function toggleFlyout(id): boolean {
    if (flyoutIsOpen(id)) {
        closeFlyout();
        return false;
    } else {
        openFlyout(id);
        return true;
    }
}

export function init() {
    opener.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    items.forEach((item) => {
        const contentId = item.getAttribute('data-content-id');
        item.addEventListener('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(contentId)
        });
    });

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

}

export function closeMenu() {
    nav.style.display = 'none';
    menu.classList.remove('open');
    closeFlyout();
}

export function openMenu() {
    nav.style.display = '';
    menu.classList.add('open');
}
