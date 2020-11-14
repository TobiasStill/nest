import {Settings} from './settings';

const settings: Settings = {
    'background': '#3f63ff',
    'mesh': {
        'color': '#ffb300'
    },
    'spotlight': {
        'color': '#ecff00',
                intensity: 0.5,
        'position': [
            -100,
            -2000,
            -100
        ],
        'castShadow': true
    },
    'pointlight': {
        'color': '#ffb300',
                intensity: 1.2,
        'position': [
            -100,
            -2000,
            -200
        ]
    }
};

export default settings;