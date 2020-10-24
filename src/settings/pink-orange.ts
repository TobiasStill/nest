import {Settings} from './settings';

const settings: Settings = {
  "background": "#000000",
  "mesh": {
    "castShadow": true,
    "receiveShadow": true,
    "color": "#BA55D3"
  },
  "ambient": {
    "color": "#ffd700"
  },
  "spotlight": {
    "color": "#ffd700",
    "position": [
      6000,
      450,
      450
    ],
    "castShadow": true,
    "shadow_mapSize_width": 1024,
    "shadow_mapSize_height": 1024,
    "shadow_camera_near": 500,
    "shadow_camera_far": 7000,
    "shadow_camera_fov": 500
  },
  "pointlight": {
    "color": "#ffd700",
    "position": [
      -100,
      100,
      200
    ]
  }
};

export default settings;