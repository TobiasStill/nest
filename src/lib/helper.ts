import {AmbientLight, Color, PointLight, SpotLight} from 'three';
import {LightSettings} from '../world-settings';

export function hexEncodeColor(str) {
    return new Color(str).getHex();
}

export function setAmbientLight(light: AmbientLight, settings: { color: string }) {
    light.color.set(hexEncodeColor(settings.color))
}

export function setLight(light: PointLight | SpotLight, settings: LightSettings) {
    light.color.set(hexEncodeColor(settings.color));
    light.position.set(...settings.position);
    light.castShadow = settings.castShadow || false;
    light.intensity = settings.intensity || 1;
}

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function getOffset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        right: rect.left + scrollLeft + rect.width
    }
}

export function getPath(event: Event): EventTarget[] {
    var path = (<{path: EventTarget[]}><unknown>event).path || (event.composedPath && event.composedPath());
    if (path) {
        return path;
    } else {
        // This browser doesn't supply path information
        return [];
    }
}

export function toggleFullScreen() {
  if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
