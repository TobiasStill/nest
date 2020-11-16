import {WorldSettings} from './settings';

const settings: WorldSettings = {
    'background': '#000000',
    'mesh': {
        'color': '#ba55d3'
    },
    'ambient': {
        'color': '#ffc125'
    },
    'spotlight': {
        'color': '#ffd700',
        'position': [
            450,
            450,
            450
        ],
        'castShadow': true,
        'intensity': 1.5,
    },
    'pointlight': {
        'color': '#f34de9',
        'position': [
            -100,
            100,
            200
        ],
        'castShadow': true,
        'intensity': 1.5,
    }
};

export default settings;