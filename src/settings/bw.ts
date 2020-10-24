import {Settings} from './settings';

const settings: Settings = {
  "background": "#ff0000",
  "ambient": {
    "color": "#ffd700"
  },
  "mesh": {
    "castShadow": true,
    "receiveShadow": true,
    "color": "#7f828c"
  },
  "spotlight": {
    "color": "#ffffff",
    "position": [
      2000,
      600,
      450
    ],
    "castShadow": true,
    "intensity": 1.6,
    "shadow_mapSize_width": 1024,
    "shadow_mapSize_height": 1024,
    "shadow_camera_near": 7000,
    "shadow_camera_far": 7777,
    "shadow_camera_fov": 7777
  },
  "pointlight": {
    "color": "#ffffff",
    "position": [
      400,
      1000,
      400
    ],
    "castShadow": true,
    "intensity": 1.2,
    "shadow_mapSize_width": 1024,
    "shadow_mapSize_height": 1024,
    "shadow_camera_near": 7000,
    "shadow_camera_far": 7777,
    "shadow_camera_fov": 7000
  }
};

export default settings;