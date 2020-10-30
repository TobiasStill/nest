import {Settings} from './settings';

const settings: Settings = {
    'background': '#000000',
    'mesh': {
        'castShadow': false,
        'receiveShadow': true,
        'color': '#ba55d3'
    },
    'ambient': {
        'color': '#ffd700'
    },
    'spotlight': {
        'color': '#fff832',
        'position': [
            6000,
            450,
            450
        ],
        'castShadow': true,
        'shadow_mapSize_width': 1024,
        'shadow_mapSize_height': 1024,
        'shadow_camera_near': 500,
        'shadow_camera_far': 7000,
        'shadow_camera_fov': 500
    },
    'pointlight': {
        'color': '#fd6a9b',
        'position': [
            -100,
            100,
            200
        ],
        'castShadow': true,
        'shadow_mapSize_width': 1024,
        'shadow_mapSize_height': 1024,
        'shadow_camera_near': 500,
        'shadow_camera_far': 7000,
        'shadow_camera_fov': 500
    }
};

export default settings;