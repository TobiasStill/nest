import {AmbientLight, Color, PointLight, SpotLight} from 'three';
import {LightSettings} from '../settings/settings';

export function hexEncodeColor(str) {
    return new Color(str).getHex();
}

export function setAmbientLight(light: AmbientLight, settings: {color: string}) {
    light.color.set(hexEncodeColor(settings.color))
}

export function setLight(light: PointLight | SpotLight, settings: LightSettings) {
    light.color.set(hexEncodeColor(settings.color));
    light.position.set(...settings.position);
    if(settings.castShadow) {
        light.castShadow = settings.castShadow;
    }
    if(settings.intensity) {
        light.intensity = settings.intensity;
    }
    if(settings.shadow_mapSize_width){
        light.shadow.mapSize.width = settings.shadow_mapSize_width;
    }
    if(settings.shadow_mapSize_height){
        light.shadow.mapSize.height = settings.shadow_mapSize_height;
    }
    if(settings.shadow_camera_near){
        light.shadow.camera.near = settings.shadow_camera_near;
    }
    if(settings.shadow_camera_far){
        light.shadow.camera.far = settings.shadow_camera_far;
    }
    if(settings.shadow_camera_fov){
        light.shadow.camera.fov = settings.shadow_camera_fov;
    }
}
