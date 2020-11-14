export interface LightSettings {
    'color': string,
    'position': [number, number, number],
    'castShadow'?: boolean,
    'intensity'?: number,
    'shadow_mapSize_width'?: number,
    'shadow_mapSize_height'?: number,
    'shadow_camera_near'?: number,
    'shadow_camera_far'?: number,
    'shadow_camera_fov'?: number
}

export interface Settings {
    'background': string,
    'ambient'?: {
        'color': string
    },
    'mesh': {
        'color': string
    },
    'spotlight': LightSettings,
    'pointlight': LightSettings
}