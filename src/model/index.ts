export enum ModelType {
    glb,
    gltf,
    ply
}

export enum ModelUrl {
    glbLow = './model/glb/nest_full_LOD4.glb',
    glbMid = './model/glb/nest_full_LOD2.glb',

    //draco GLTF
    gltfLow = './model/glb/nest_full_LOD4.gltf',
    gltfMid = './model/glb/nest_full_LOD2.gltf',

    //raw PLY
    plyLow = './model/ply/nest_full_LOD4.ply',
    plyMid = './model/ply/nest_full_LOD2.ply',

    // testing
    plyCube = './model/ply/cube.ply'
}

export interface ModelInformation {
    description: string;
    url: ModelUrl,
    type: ModelType
}

export type ModelSet = {
    [m: string]: ModelInformation
}

export const model: ModelSet = {
    glbLow : {type: ModelType.glb, url: ModelUrl.glbLow,    description: 'GLB, niedrige Auflösung (52 MB)'},
    glbMid : {type: ModelType.glb, url: ModelUrl.glbMid,    description: 'GLB, mittlere Auflösung (182 MB)'},
    gltfLow: {type: ModelType.gltf, url: ModelUrl.gltfLow,   description: 'GLTF, niedrige Auflösung, komprimiert (15 MB), nur für Desktop-Rechner mit ausreichendem Arbeitsspeicher geeignet'},
    gltfMid: {type: ModelType.gltf, url: ModelUrl.gltfMid,   description: 'GLTF, mittlere Auflösung, komprimiert (45 MB), nur für Desktop-Rechner mit ausreichendem Arbeitsspeicher geeignet'},
    plyLow : {type: ModelType.ply, url: ModelUrl.plyLow,    description: 'PLY, niedrige Auflösung (44 MB)'},
    plyMid : {type: ModelType.ply, url: ModelUrl.plyMid,    description: 'PLY, mittlere Auflösung (44 MB)'},
    plyCube: {type: ModelType.ply, url: ModelUrl.plyCube,   description: 'Niedrige Auflösung (44 MB)'},
};