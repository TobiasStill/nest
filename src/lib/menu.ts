import {toggleFlyout, closeFlyout} from './flyout';

const menu = document.getElementById('menu');
const nav = document.getElementsByTagName('nav')[0];
const opener = menu.getElementsByClassName('opener')[0];
const items = Array.from(nav.getElementsByTagName('li'));

function menuIsOpen() {
    return nav.style.display !== 'none';
}

export function closeMenu() {
    nav.style.display = 'none';
    menu.classList.remove('open');
    closeFlyout();
    items.forEach((item) => {
        item.classList.remove('active');
    })
}

export function openMenu() {
    nav.style.display = '';
    menu.classList.add('open');
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
    })
}

