import {WorldSettings} from './settings';

const settings: WorldSettings = {
  "background": "#17fffd",
  "mesh": {
    "color": "#7f828c"
  },
  "spotlight": {
    "color": "#e1e1e1",
    "position": [
      100,
      200,
      600
    ],
    "castShadow": true,
    "intensity": 1.6
  },
  "pointlight": {
    "color": "#ffffff",
    "position": [
      100,
      200,
      100
    ],
    "castShadow": true,
    "intensity": 1
  }
};

export default settings;