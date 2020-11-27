import {WorldSettings} from './';

const settings: WorldSettings = {
    'background': '#2056fd',
    'mesh': {
        'color': '#ffbecc'
    },
    'spotlight': {
        'color': '#68088d',
        'position': [
            450,
            2000,
            450
        ],
        'castShadow': true,
        intensity: 1.5
    },
    'pointlight': {
        'color': '#ff1a41',
        intensity: 0.5,
        'castShadow': true,
        'position': [
            100,
            100,
            200
        ]
    }
};

export default settings;