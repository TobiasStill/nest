import {Settings} from './settings';

const settings: Settings = {
    'background': '#020213',
    'mesh': {
        'color': '#38a130'
    },
    'spotlight': {
        'color': '#f14eff',
                intensity: 1.5,
        'position': [
            100,
            2000,
            100
        ],
        'castShadow': true
    },
    'pointlight': {
        'color': '#583eff',
                intensity: 1.8,
        'position': [
            100,
            2000,
            200
        ]
    }
};

export default settings;