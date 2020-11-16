import bw from './bw';
import green from './green';
import pinkOrange from './pink-orange';
import polyester from './polyester';
import red from './red';
import sonne from './sonne';

export interface LightSettings {
    'color': string,
    'position': [number, number, number],
    'castShadow'?: boolean,
    'intensity'?: number
}

export interface WorldSettings {
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

export const WorldVariants: Readonly<Array<string>> = [
    'bw',
    'green',
    'pink-orange',
    'polyester',
    'red',
    'sonne'
];

export type WorldVariant = typeof WorldVariants[number];

export type VariantSettings = {
    [o in WorldVariant]: WorldSettings
}

export const variants: VariantSettings = {
    bw,
    green,
    'pink-orange': pinkOrange,
    polyester,
    red,
    sonne
};
